import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Service role client for bypassing RLS when saving Instagram accounts
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface InstagramTokenResponse {
  access_token: string;
  user_id: number;
}

interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface InstagramUserProfile {
  id: string;
  username: string;
  account_type?: string;
  profile_picture_url?: string;
  name?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

/**
 * GET /api/instagram/callback
 * Handles the OAuth callback from Instagram Business Login
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // User ID passed in state
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Redirect to /dashboard/instagram - middleware will convert to /${username}/dashboard/instagram
  const redirectUrl = new URL('/dashboard/instagram', APP_URL);

  // Handle OAuth errors
  if (error) {
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!code) {
    redirectUrl.searchParams.set('error', 'No authorization code received');
    return NextResponse.redirect(redirectUrl.toString());
  }

  const supabase = createSupabaseServerClient();

  // Verify user is authenticated and matches state
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirectUrl.searchParams.set('error', 'Not authenticated');
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (state && state !== user.id) {
    redirectUrl.searchParams.set('error', 'Invalid state parameter');
    return NextResponse.redirect(redirectUrl.toString());
  }

  try {
    // Validate required environment variables
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      redirectUrl.searchParams.set('error', 'Instagram API not configured');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Step 1: Exchange code for short-lived access token (Instagram Business Login)
    const tokenResponse = await fetch(
      'https://api.instagram.com/oauth/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: `${APP_URL}/api/instagram/callback`,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      throw new Error(errorData.error_message || 'Failed to exchange code for token');
    }

    const tokenData: InstagramTokenResponse = await tokenResponse.json();

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: clientSecret,
          access_token: tokenData.access_token,
        })
    );

    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.json();
      console.error('Long-lived token error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get long-lived token');
    }

    const longLivedTokenData: InstagramLongLivedTokenResponse = await longLivedTokenResponse.json();

    // Step 3: Get Instagram user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?` +
        new URLSearchParams({
          fields: 'id,username,account_type,profile_picture_url,name,followers_count,follows_count,media_count',
          access_token: longLivedTokenData.access_token,
        })
    );

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('Profile fetch error:', errorData);
      throw new Error('Failed to fetch Instagram profile');
    }

    const profile: InstagramUserProfile = await profileResponse.json();

    // Calculate token expiry (long-lived tokens last ~60 days)
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (longLivedTokenData.expires_in || 5184000));

    // Step 4: Save or update Instagram account in database using service role to bypass RLS
    const adminClient = getSupabaseAdmin();
    const { data: upsertData, error: upsertError } = await adminClient
      .from('instagram_accounts')
      .upsert(
        {
          user_id: user.id,
          ig_user_id: profile.id,
          username: profile.username,
          profile_pic_url: profile.profile_picture_url || null,
          profile_picture_url: profile.profile_picture_url || null,
          name: profile.name || profile.username,
          access_token: longLivedTokenData.access_token,
          token_expiry: tokenExpiry.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'ig_user_id',
          ignoreDuplicates: false,
        }
      )
      .select();

    if (upsertError) {
      console.error('Failed to save Instagram account:', upsertError);
      redirectUrl.searchParams.set('error', 'Failed to save Instagram account');
      return NextResponse.redirect(redirectUrl.toString());
    }

    console.log('Instagram account saved:', upsertData);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('account', profile.id);
    redirectUrl.searchParams.set('username', profile.username);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    redirectUrl.searchParams.set('error', err instanceof Error ? err.message : 'Connection failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
