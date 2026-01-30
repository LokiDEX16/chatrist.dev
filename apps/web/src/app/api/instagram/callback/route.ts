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

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
  name?: string;
}

/**
 * GET /api/instagram/callback
 * Handles the OAuth callback from Facebook/Instagram
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

    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await fetch(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: `${APP_URL}/api/instagram/callback`,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error?.message || 'Failed to exchange code for token');
    }

    const tokenData: FacebookTokenResponse = await tokenResponse.json();

    // Step 2: Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: tokenData.access_token,
        })
    );

    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.json();
      throw new Error(errorData.error?.message || 'Failed to get long-lived token');
    }

    const longLivedTokenData: FacebookTokenResponse = await longLivedTokenResponse.json();

    // Step 3: Get Facebook pages with Instagram accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?` +
        new URLSearchParams({
          fields: 'id,name,access_token,instagram_business_account',
          access_token: longLivedTokenData.access_token,
        })
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const pagesData = await pagesResponse.json();
    const pages: FacebookPage[] = pagesData.data || [];

    // Find pages with Instagram business accounts
    const pagesWithInstagram = pages.filter((page) => page.instagram_business_account);

    if (pagesWithInstagram.length === 0) {
      redirectUrl.searchParams.set('error', 'No Instagram Business account found. Please connect an Instagram Business or Creator account to a Facebook Page.');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Step 4: Get Instagram account details and save
    let connectedAccounts = 0;

    for (const page of pagesWithInstagram) {
      if (!page.instagram_business_account) continue;

      // Get Instagram account details
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?` +
          new URLSearchParams({
            fields: 'id,username,profile_picture_url,name',
            access_token: page.access_token,
          })
      );

      if (!igResponse.ok) {
        console.error(`Failed to fetch Instagram account for page ${page.name}:`, await igResponse.text());
        continue;
      }

      const igAccount: InstagramAccount = await igResponse.json();

      // Calculate token expiry (long-lived tokens last ~60 days)
      const tokenExpiry = new Date();
      tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (longLivedTokenData.expires_in || 5184000));

      // Save or update Instagram account in database using service role to bypass RLS
      const adminClient = getSupabaseAdmin();
      const { data: upsertData, error: upsertError } = await adminClient
        .from('instagram_accounts')
        .upsert(
          {
            user_id: user.id,
            ig_user_id: igAccount.id,
            username: igAccount.username,
            profile_pic_url: igAccount.profile_picture_url || null,
            profile_picture_url: igAccount.profile_picture_url || null,
            name: igAccount.name,
            access_token: page.access_token, // Use page token for API calls
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
      } else {
        console.log('Instagram account saved:', upsertData);
        connectedAccounts++;
      }
    }

    if (connectedAccounts > 0) {
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('account', pagesWithInstagram[0].instagram_business_account?.id || '');
    } else {
      redirectUrl.searchParams.set('error', 'Failed to save Instagram account');
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Instagram OAuth error:', err);
    redirectUrl.searchParams.set('error', err instanceof Error ? err.message : 'Connection failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
