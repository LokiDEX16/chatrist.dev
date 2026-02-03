import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/instagram/connect
 * Redirects user to Instagram Business Login OAuth authorization page
 */
export async function GET() {
  const supabase = createSupabaseServerClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/instagram/callback`;

  if (!clientId) {
    // Redirect to /dashboard/instagram with error - middleware will convert to /${username}/dashboard/instagram
    return NextResponse.redirect(
      new URL('/dashboard/instagram?error=Instagram API not configured', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }

  // Instagram Business Login scopes
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ].join(',');

  // Build Instagram OAuth URL (Direct Instagram Business Login)
  const authUrl = new URL('https://www.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', user.id); // Pass user ID in state for security
  authUrl.searchParams.set('force_reauth', 'true'); // Force re-authentication

  return NextResponse.redirect(authUrl.toString());
}
