import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processTrigger } from '@/lib/flow-executor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

/**
 * GET /api/instagram/poll-comments
 *
 * Polls Instagram for new comments on posts and processes them
 * against active COMMENT campaigns. This is an alternative to
 * webhooks that works with any Instagram account type.
 *
 * Called by:
 * - Vercel Cron (every minute on Pro plan)
 * - External cron service (e.g., cron-job.org)
 * - Manual trigger from dashboard
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const querySecret = new URL(request.url).searchParams.get('secret');

    // Accept: Bearer token header (Vercel Cron), or ?secret= query param
    if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const results = {
    triggersCreated: 0,
    triggersProcessed: 0,
    commentsScanned: 0,
    mediaScanned: 0,
    errors: [] as string[],
  };

  try {
    // 1. Get all active COMMENT campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, trigger_type, trigger_config, instagram_account_id')
      .eq('trigger_type', 'COMMENT')
      .eq('status', 'ACTIVE');

    if (campaignError || !campaigns || campaigns.length === 0) {
      console.log('Poll: No active COMMENT campaigns found');
      return NextResponse.json({ ...results, message: 'No active COMMENT campaigns' });
    }

    console.log(`Poll: Found ${campaigns.length} active COMMENT campaigns`);

    // 2. Get unique Instagram account IDs
    const accountIds = [...new Set(campaigns.map((c) => c.instagram_account_id))];

    // 3. Fetch Instagram accounts
    const { data: accounts } = await supabase
      .from('instagram_accounts')
      .select('id, ig_user_id, access_token, username')
      .in('id', accountIds);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ ...results, message: 'No Instagram accounts found' });
    }

    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    // 4. Batch-fetch all existing trigger source_ids for deduplication
    const campaignIds = campaigns.map((c) => c.id);
    const { data: existingTriggers } = await supabase
      .from('triggers')
      .select('source_id, campaign_id')
      .in('campaign_id', campaignIds)
      .eq('type', 'COMMENT');

    const processedComments = new Set(
      (existingTriggers || []).map((t) => `${t.campaign_id}:${t.source_id}`)
    );

    console.log(`Poll: ${processedComments.size} comments already processed`);

    // 5. Group campaigns by account
    const campaignsByAccount = new Map<string, typeof campaigns>();
    for (const campaign of campaigns) {
      const existing = campaignsByAccount.get(campaign.instagram_account_id) || [];
      existing.push(campaign);
      campaignsByAccount.set(campaign.instagram_account_id, existing);
    }

    // 6. For each account, fetch media and comments
    for (const [accountId, accountCampaigns] of campaignsByAccount) {
      const account = accountMap.get(accountId);
      if (!account || !account.access_token) {
        results.errors.push(`No access token for account ${accountId}`);
        continue;
      }

      console.log(`Poll: Checking account @${account.username} (${account.ig_user_id})`);

      // Fetch recent media
      const mediaResponse = await fetch(
        `https://graph.instagram.com/${account.ig_user_id}/media?` +
          new URLSearchParams({
            fields: 'id,timestamp',
            limit: '10',
            access_token: account.access_token,
          })
      );

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json().catch(() => ({}));
        const errMsg = `Failed to fetch media for @${account.username}: ${(errorData as { error?: { message?: string } }).error?.message || mediaResponse.statusText}`;
        console.error('Poll:', errMsg);
        results.errors.push(errMsg);
        continue;
      }

      const mediaData = await mediaResponse.json();
      const mediaItems = (mediaData.data || []) as Array<{ id: string; timestamp?: string }>;
      console.log(`Poll: Found ${mediaItems.length} media items for @${account.username}`);

      for (const media of mediaItems) {
        results.mediaScanned++;

        // Check if any campaign targets a specific post
        const relevantCampaigns = accountCampaigns.filter((c) => {
          const config = c.trigger_config as { postId?: string } | null;
          return !config?.postId || config.postId === media.id;
        });

        if (relevantCampaigns.length === 0) continue;

        // Fetch comments for this media
        const commentsResponse = await fetch(
          `https://graph.instagram.com/${media.id}/comments?` +
            new URLSearchParams({
              fields: 'id,text,username,timestamp,from',
              limit: '50',
              access_token: account.access_token,
            })
        );

        if (!commentsResponse.ok) {
          const errorData = await commentsResponse.json().catch(() => ({}));
          const errMsg = `Comments API error for media ${media.id}: ${(errorData as { error?: { message?: string } }).error?.message || commentsResponse.statusText}`;
          console.error('Poll:', errMsg);
          results.errors.push(errMsg);
          continue;
        }

        const commentsData = await commentsResponse.json();
        const comments = (commentsData.data || []) as Array<{
          id: string;
          text?: string;
          username?: string;
          timestamp?: string;
          from?: { id?: string; username?: string };
        }>;

        console.log(`Poll: Found ${comments.length} comments on media ${media.id}`);

        for (const comment of comments) {
          results.commentsScanned++;

          // Skip own comments
          if (comment.username === account.username) continue;

          const commenterId = comment.from?.id || comment.username || '';
          const commenterUsername = comment.username || comment.from?.username || 'unknown';

          // Check each campaign
          for (const campaign of relevantCampaigns) {
            const config = campaign.trigger_config as {
              keywords?: string[];
              caseSensitive?: boolean;
              matchAll?: boolean;
            } | null;

            // Deduplicate
            const dedupeKey = `${campaign.id}:${comment.id}`;
            if (processedComments.has(dedupeKey)) continue;

            // Check keyword matching
            if (config?.keywords && config.keywords.length > 0) {
              const commentText = comment.text || '';
              const textToCheck = config.caseSensitive ? commentText : commentText.toLowerCase();
              const hasMatch = config.keywords.some((kw: string) => {
                const keyword = config.caseSensitive ? kw : kw.toLowerCase();
                return textToCheck.includes(keyword);
              });
              if (!hasMatch) continue;
            }

            console.log(`Poll: New matching comment "${comment.text}" by @${commenterUsername} on media ${media.id}`);

            // Create trigger
            const { data: newTrigger, error: insertError } = await supabase
              .from('triggers')
              .insert({
                campaign_id: campaign.id,
                ig_user_id: commenterId,
                ig_username: commenterUsername,
                type: 'COMMENT',
                source_id: comment.id,
                source_text: comment.text || '',
                metadata: { ...comment, media_id: media.id },
                status: 'PENDING',
              })
              .select('id')
              .single();

            if (insertError) {
              results.errors.push(`Failed to create trigger: ${insertError.message}`);
              continue;
            }

            // Mark as processed in our set
            processedComments.add(dedupeKey);
            results.triggersCreated++;

            // Process the trigger immediately
            if (newTrigger?.id) {
              try {
                const processResult = await processTrigger(newTrigger.id);
                if (processResult.success) {
                  results.triggersProcessed++;
                  console.log(`Poll: Successfully processed trigger ${newTrigger.id}`);
                } else {
                  console.error(`Poll: Trigger ${newTrigger.id} failed:`, processResult.error);
                  results.errors.push(`Trigger ${newTrigger.id}: ${processResult.error}`);
                }
              } catch (err) {
                console.error(`Poll: Error processing trigger ${newTrigger.id}:`, err);
                results.errors.push(`Trigger ${newTrigger.id}: ${String(err)}`);
              }
            }
          }
        }
      }
    }

    console.log('Poll completed:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Poll comments error:', error);
    return NextResponse.json(
      {
        ...results,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
