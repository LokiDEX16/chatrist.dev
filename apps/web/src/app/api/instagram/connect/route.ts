import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/instagram/connect
 * Redirects user to Instagram OAuth authorization page
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

  // Instagram OAuth scopes for Graph API
  // For Instagram Graph API, we need to go through Facebook OAuth
  const scopes = [
    'instagram_basic',
    'instagram_manage_messages',
    'instagram_manage_comments',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',');

  // Build Facebook OAuth URL (Instagram Graph API uses Facebook OAuth)
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', user.id); // Pass user ID in state for security

  return NextResponse.redirect(authUrl.toString());
}
