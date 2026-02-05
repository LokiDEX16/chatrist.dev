import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chatrist-dev-web-git-main-lokeshs-projects-e389820e.vercel.app';

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
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const redirectUrl = new URL('/dashboard/instagram', APP_URL);

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', error, errorDescription);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!code) {
    redirectUrl.searchParams.set('error', 'No authorization code received');
    return NextResponse.redirect(redirectUrl.toString());
  }

  const supabase = createSupabaseServerClient();

  // Verify user is authenticated
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
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      redirectUrl.searchParams.set('error', 'Instagram API not configured');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Step 1: Exchange code for short-lived access token
    const tokenFormData = new URLSearchParams();
    tokenFormData.append('client_id', clientId);
    tokenFormData.append('client_secret', clientSecret);
    tokenFormData.append('grant_type', 'authorization_code');
    tokenFormData.append('redirect_uri', `${APP_URL}/api/instagram/callback`);
    tokenFormData.append('code', code);

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenFormData,
    });

    const tokenText = await tokenResponse.text();
    console.log('Token response:', tokenText);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenText);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData: InstagramTokenResponse = JSON.parse(tokenText);

    // Step 2: Exchange for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: clientSecret,
          access_token: tokenData.access_token,
        })
    );

    if (!longLivedResponse.ok) {
      const errorText = await longLivedResponse.text();
      console.error('Long-lived token failed:', errorText);
      throw new Error('Failed to get long-lived token');
    }

    const longLivedData: InstagramLongLivedTokenResponse = await longLivedResponse.json();

    // Step 3: Get user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?` +
        new URLSearchParams({
          fields: 'id,username,account_type,profile_picture_url,name',
          access_token: longLivedData.access_token,
        })
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', errorText);
      throw new Error('Failed to fetch Instagram profile');
    }

    const profile: InstagramUserProfile = await profileResponse.json();
    console.log('Instagram profile:', profile);

    // Calculate token expiry (~60 days)
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (longLivedData.expires_in || 5184000));

    // Step 4: Save to database
    const adminClient = getSupabaseAdmin();
    const { data: upsertData, error: upsertError } = await adminClient
      .from('instagram_accounts')
      .upsert(
        {
          user_id: user.id,
          ig_user_id: profile.id,
          username: profile.username,
          profile_pic_url: profile.profile_picture_url || null,
          name: profile.name || profile.username,
          access_token: longLivedData.access_token,
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
      console.error('Database error:', upsertError);
      redirectUrl.searchParams.set('error', 'Failed to save Instagram account');
      return NextResponse.redirect(redirectUrl.toString());
    }

    console.log('Instagram account saved:', upsertData);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('username', profile.username);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    redirectUrl.searchParams.set('error', err instanceof Error ? err.message : 'Connection failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
