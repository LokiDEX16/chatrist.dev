import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/instagram/setup
 * Quick setup for single-account usage - uses INSTAGRAM_ACCESS_TOKEN from env
 */
export async function GET() {
  const supabase = createSupabaseServerClient();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chatrist-dev-web.vercel.app';

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL('/login', APP_URL));
  }

  const redirectUrl = new URL('/dashboard/instagram', APP_URL);

  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      redirectUrl.searchParams.set('error', 'INSTAGRAM_ACCESS_TOKEN not configured in environment');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Fetch profile using the access token
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?` +
        new URLSearchParams({
          fields: 'id,username,account_type,profile_picture_url,name',
          access_token: accessToken,
        })
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', errorText);
      redirectUrl.searchParams.set('error', 'Invalid access token or token expired');
      return NextResponse.redirect(redirectUrl.toString());
    }

    const profile = await profileResponse.json();
    console.log('Instagram profile:', profile);

    // Token expiry - assume 60 days from now (refresh manually when needed)
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 60);

    // Save to database using service role
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: upsertData, error: upsertError } = await adminClient
      .from('instagram_accounts')
      .upsert(
        {
          user_id: user.id,
          ig_user_id: profile.id,
          username: profile.username,
          profile_pic_url: profile.profile_picture_url || null,
          name: profile.name || profile.username,
          access_token: accessToken,
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
    console.error('Instagram setup error:', err);
    redirectUrl.searchParams.set('error', err instanceof Error ? err.message : 'Setup failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
