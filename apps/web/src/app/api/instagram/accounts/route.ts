import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/instagram/accounts
 * List all Instagram accounts connected by the current user
 */
export async function GET() {
  const supabase = createSupabaseServerClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Fetch Instagram accounts with campaign count
  const { data: accounts, error } = await supabase
    .from('instagram_accounts')
    .select(`
      id,
      ig_user_id,
      username,
      profile_pic_url,
      name,
      is_active,
      token_expiry,
      created_at,
      updated_at,
      campaigns:campaigns(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Instagram accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }

  interface AccountRow {
    id: string;
    ig_user_id: string;
    username: string;
    profile_pic_url: string | null;
    name: string | null;
    is_active: boolean;
    token_expiry: string | null;
    created_at: string;
    updated_at: string;
    campaigns: { count: number }[];
  }

  // Transform data to camelCase for frontend
  const transformedAccounts = ((accounts || []) as AccountRow[]).map((account) => ({
    id: account.id,
    igUserId: account.ig_user_id,
    username: account.username,
    profilePicUrl: account.profile_pic_url,
    name: account.name,
    isActive: account.is_active,
    tokenExpiry: account.token_expiry,
    createdAt: account.created_at,
    updatedAt: account.updated_at,
    campaignCount: account.campaigns?.[0]?.count || 0,
  }));

  console.log('Returning Instagram accounts:', transformedAccounts.length);
  return NextResponse.json({ data: transformedAccounts });
}
