import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // Verify user is authenticated
    const authSupabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to access the token (not exposed to browser client)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the account belongs to the authenticated user
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('ig_user_id, access_token, username')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    if (!account.access_token) {
      return NextResponse.json({ error: 'No access token. Please reconnect your Instagram account.' }, { status: 401 });
    }

    // Fetch media from Instagram Graph API
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.ig_user_id}/media?` +
        new URLSearchParams({
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
          limit: '25',
          access_token: account.access_token,
        })
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json();
      console.error('Instagram API error:', errorData);

      // Token expired
      if (errorData?.error?.code === 190) {
        return NextResponse.json({ error: 'Access token expired. Please reconnect your Instagram account.' }, { status: 401 });
      }

      return NextResponse.json({ error: 'Failed to fetch Instagram posts' }, { status: 502 });
    }

    const mediaData = await mediaResponse.json();

    return NextResponse.json({
      data: mediaData.data || [],
      paging: mediaData.paging,
      username: account.username,
    });
  } catch (error) {
    console.error('Instagram posts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
