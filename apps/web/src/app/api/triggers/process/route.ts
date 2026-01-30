import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processTrigger, processPendingTriggers } from '@/lib/flow-executor';

/**
 * POST /api/triggers/process
 * Process pending triggers and execute their flows
 *
 * Body options:
 * - { triggerId: string } - Process a specific trigger
 * - { campaignId: string } - Process all pending triggers for a campaign
 * - {} - Process all pending triggers (up to 50)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { triggerId, campaignId } = body;

    if (triggerId) {
      // Process single trigger
      // Verify trigger belongs to user's campaign
      const { data: trigger } = await supabase
        .from('triggers')
        .select('id, campaigns!inner(user_id)')
        .eq('id', triggerId)
        .single();

      // Extract user_id from the campaigns join (singular due to !inner)
      const campaignUserId = trigger?.campaigns
        ? (trigger.campaigns as unknown as { user_id: string }).user_id
        : null;

      if (!trigger || campaignUserId !== user.id) {
        return NextResponse.json(
          { error: 'Trigger not found' },
          { status: 404 }
        );
      }

      const result = await processTrigger(triggerId);
      return NextResponse.json(result);
    }

    if (campaignId) {
      // Verify campaign belongs to user
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const result = await processPendingTriggers(campaignId);
      return NextResponse.json(result);
    }

    // Process all pending triggers for user's campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE');

    let totalProcessed = 0;
    let totalFailed = 0;

    for (const campaign of campaigns || []) {
      const result = await processPendingTriggers(campaign.id);
      totalProcessed += result.processed;
      totalFailed += result.failed;
    }

    return NextResponse.json({
      processed: totalProcessed,
      failed: totalFailed,
    });
  } catch (error) {
    console.error('Error processing triggers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/triggers/process
 * Get pending trigger count for user's campaigns
 */
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get count of pending triggers for user's campaigns
    const { count, error } = await supabase
      .from('triggers')
      .select('id, campaigns!inner(user_id)', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .eq('campaigns.user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch triggers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pendingCount: count || 0 });
  } catch (error) {
    console.error('Error fetching triggers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}
