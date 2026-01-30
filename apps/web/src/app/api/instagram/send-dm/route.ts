import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authSupabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, recipientId, message } = body;

    if (!accountId || !recipientId || !message) {
      return NextResponse.json(
        { error: 'accountId, recipientId, and message are required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Use service role to access the token (not exposed to browser client)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the account belongs to the authenticated user
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('ig_user_id, access_token')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    if (!account.access_token) {
      return NextResponse.json(
        { error: 'No access token. Please reconnect your Instagram account.' },
        { status: 401 }
      );
    }

    // Send DM via Instagram Graph API
    const dmResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.ig_user_id}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: account.access_token,
        }),
      }
    );

    if (!dmResponse.ok) {
      const errorData = await dmResponse.json();
      console.error('Instagram DM API error:', errorData);

      if (errorData?.error?.code === 190) {
        return NextResponse.json(
          { error: 'Access token expired. Please reconnect your Instagram account.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errorData?.error?.message || 'Failed to send DM' },
        { status: 502 }
      );
    }

    const result = await dmResponse.json();

    return NextResponse.json({ success: true, messageId: result.message_id });
  } catch (error) {
    console.error('Send DM API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
