import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/instagram/accounts/[id]
 * Get a specific Instagram account
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const { id } = params;

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: account, error } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({ data: account });
}

/**
 * DELETE /api/instagram/accounts/[id]
 * Disconnect (delete) an Instagram account
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const { id } = params;

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if account exists and belongs to user
  const { data: account, error: fetchError } = await supabase
    .from('instagram_accounts')
    .select('id, username')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // Check for active campaigns using this account
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .eq('instagram_account_id', id)
    .in('status', ['ACTIVE', 'PAUSED']);

  if (campaignsError) {
    return NextResponse.json({ error: 'Failed to check campaigns' }, { status: 500 });
  }

  if (campaigns && campaigns.length > 0) {
    const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
    if (activeCampaigns.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot disconnect account with active campaigns',
          campaigns: activeCampaigns.map((c) => c.name),
        },
        { status: 400 }
      );
    }
  }

  // Delete the account
  const { error: deleteError } = await supabase
    .from('instagram_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Error deleting Instagram account:', deleteError);
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `Disconnected @${account.username}` });
}

/**
 * POST /api/instagram/accounts/[id]/refresh
 * Refresh the access token for an Instagram account
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const { id } = params;

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the account with its current token
  const { data: account, error: fetchError } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  if (!account.access_token) {
    return NextResponse.json({ error: 'No access token to refresh' }, { status: 400 });
  }

  try {
    // Refresh the long-lived token
    const refreshResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: process.env.INSTAGRAM_CLIENT_ID!,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
          fb_exchange_token: account.access_token,
        })
    );

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      throw new Error(errorData.error?.message || 'Failed to refresh token');
    }

    const tokenData = await refreshResponse.json();

    // Calculate new expiry (long-lived tokens last ~60 days)
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (tokenData.expires_in || 5184000));

    // Update the token in database
    const { error: updateError } = await supabase
      .from('instagram_accounts')
      .update({
        access_token: tokenData.access_token,
        token_expiry: tokenExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw new Error('Failed to save refreshed token');
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      tokenExpiry: tokenExpiry.toISOString(),
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
