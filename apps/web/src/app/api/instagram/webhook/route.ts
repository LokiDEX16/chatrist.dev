import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processTrigger } from '@/lib/flow-executor';

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Webhook verification (GET) - Facebook sends a GET request to verify the webhook.
 * Also handles comment polling when called with ?poll=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Comment polling mode: GET /api/instagram/webhook?poll=true
  if (searchParams.get('poll') === 'true') {
    return pollComments();
  }

  // Normal webhook verification
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * Poll Instagram for new comments and process them against active campaigns.
 * Alternative to webhooks - works with any Instagram account type.
 */
async function pollComments() {
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
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, trigger_type, trigger_config, instagram_account_id')
      .eq('trigger_type', 'COMMENT')
      .eq('status', 'ACTIVE');

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ ...results, message: 'No active COMMENT campaigns' });
    }

    console.log(`Poll: Found ${campaigns.length} active COMMENT campaigns`);

    // 2. Get Instagram accounts
    const accountIds = [...new Set(campaigns.map((c) => c.instagram_account_id))];
    const { data: accounts } = await supabase
      .from('instagram_accounts')
      .select('id, ig_user_id, access_token, username')
      .in('id', accountIds);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ ...results, message: 'No Instagram accounts found' });
    }

    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    // 3. Batch-fetch existing trigger source_ids for deduplication
    const campaignIds = campaigns.map((c) => c.id);
    const { data: existingTriggers } = await supabase
      .from('triggers')
      .select('source_id, campaign_id')
      .in('campaign_id', campaignIds)
      .eq('type', 'COMMENT');

    const processedComments = new Set(
      (existingTriggers || []).map((t) => `${t.campaign_id}:${t.source_id}`)
    );

    // 4. Group campaigns by account
    const campaignsByAccount = new Map<string, typeof campaigns>();
    for (const campaign of campaigns) {
      const list = campaignsByAccount.get(campaign.instagram_account_id) || [];
      list.push(campaign);
      campaignsByAccount.set(campaign.instagram_account_id, list);
    }

    // 5. For each account, fetch media and comments
    for (const [accountId, accountCampaigns] of campaignsByAccount) {
      const account = accountMap.get(accountId);
      if (!account?.access_token) continue;

      console.log(`Poll: Checking @${account.username}`);

      // Fetch recent media
      const mediaRes = await fetch(
        `https://graph.instagram.com/${account.ig_user_id}/media?` +
          new URLSearchParams({
            fields: 'id,timestamp',
            limit: '10',
            access_token: account.access_token,
          })
      );

      if (!mediaRes.ok) {
        const err = await mediaRes.json().catch(() => ({}));
        results.errors.push(`Media fetch failed: ${(err as Record<string, Record<string, string>>).error?.message || mediaRes.statusText}`);
        continue;
      }

      const mediaData = await mediaRes.json();
      const mediaItems = (mediaData.data || []) as Array<{ id: string }>;

      for (const media of mediaItems) {
        results.mediaScanned++;

        // Filter campaigns relevant to this post
        const relevant = accountCampaigns.filter((c) => {
          const cfg = c.trigger_config as { postId?: string } | null;
          return !cfg?.postId || cfg.postId === media.id;
        });
        if (relevant.length === 0) continue;

        // Fetch comments
        const commentsRes = await fetch(
          `https://graph.instagram.com/${media.id}/comments?` +
            new URLSearchParams({
              fields: 'id,text,username,timestamp,from',
              limit: '50',
              access_token: account.access_token,
            })
        );

        if (!commentsRes.ok) {
          const err = await commentsRes.json().catch(() => ({}));
          results.errors.push(`Comments fetch failed for ${media.id}: ${(err as Record<string, Record<string, string>>).error?.message || commentsRes.statusText}`);
          continue;
        }

        const commentsData = await commentsRes.json();
        const comments = (commentsData.data || []) as Array<{
          id: string;
          text?: string;
          username?: string;
          timestamp?: string;
          from?: { id?: string; username?: string };
        }>;

        for (const comment of comments) {
          results.commentsScanned++;
          if (comment.username === account.username) continue; // Skip self

          const commenterId = comment.from?.id || comment.username || '';
          const commenterUsername = comment.username || comment.from?.username || 'unknown';

          for (const campaign of relevant) {
            const config = campaign.trigger_config as {
              keywords?: string[];
              caseSensitive?: boolean;
            } | null;

            // Deduplicate
            const key = `${campaign.id}:${comment.id}`;
            if (processedComments.has(key)) continue;

            // Check keywords
            if (config?.keywords && config.keywords.length > 0) {
              const text = config.caseSensitive ? (comment.text || '') : (comment.text || '').toLowerCase();
              const match = config.keywords.some((kw: string) => {
                const k = config.caseSensitive ? kw : kw.toLowerCase();
                return text.includes(k);
              });
              if (!match) continue;
            }

            console.log(`Poll: Match! "${comment.text}" by @${commenterUsername}`);

            // Create trigger
            const { data: newTrigger, error: insertErr } = await supabase
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

            if (insertErr) {
              results.errors.push(`Insert failed: ${insertErr.message}`);
              continue;
            }

            processedComments.add(key);
            results.triggersCreated++;

            // Process immediately
            if (newTrigger?.id) {
              try {
                const res = await processTrigger(newTrigger.id);
                if (res.success) {
                  results.triggersProcessed++;
                  console.log(`Poll: Trigger ${newTrigger.id} processed OK`);
                } else {
                  results.errors.push(`Trigger ${newTrigger.id}: ${res.error}`);
                }
              } catch (err) {
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
    console.error('Poll error:', error);
    return NextResponse.json(
      { ...results, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Webhook event handler (POST) - receives Instagram events:
 * - comments on posts
 * - story replies
 * - DM messages
 * - new followers
 */
export async function POST(request: NextRequest) {
  // Request-scoped queue (not module-level to avoid race conditions in serverless)
  const triggerQueue: string[] = [];

  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const { object, entry } = body;

    if (object !== 'instagram') {
      console.log('Ignoring non-instagram webhook:', object);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    for (const event of entry || []) {
      const igUserId = event.id;

      // Find the Instagram account
      const { data: account } = await supabase
        .from('instagram_accounts')
        .select('id, user_id')
        .eq('ig_user_id', igUserId)
        .single();

      if (!account) {
        console.log('No account found for ig_user_id:', igUserId);
        continue;
      }

      console.log('Found account:', account.id, 'for ig_user_id:', igUserId);

      // Find active campaigns for this Instagram account
      const { data: activeCampaigns } = await supabase
        .from('campaigns')
        .select('id, trigger_type, trigger_config')
        .eq('instagram_account_id', account.id)
        .eq('status', 'ACTIVE');

      if (!activeCampaigns || activeCampaigns.length === 0) {
        console.log('No active campaigns for account:', account.id);
        continue;
      }

      console.log('Found', activeCampaigns.length, 'active campaigns');

      // Process messaging events (DMs, story replies)
      if (event.messaging) {
        for (const msg of event.messaging) {
          const senderId = msg.sender?.id;
          const messageText = msg.message?.text || '';
          const senderUsername = msg.sender?.username || senderId || 'unknown';

          if (!senderId || senderId === igUserId) continue;

          const triggerType = msg.message?.reply_to ? 'STORY_REPLY' : 'DM_KEYWORD';

          // Find matching campaigns for this trigger type
          const matchingCampaigns = activeCampaigns.filter(
            (c) => c.trigger_type === triggerType
          );

          for (const campaign of matchingCampaigns) {
            // For DM_KEYWORD triggers, check if message contains any keywords
            const config = campaign.trigger_config as { keywords?: string[]; caseSensitive?: boolean } | null;
            if (triggerType === 'DM_KEYWORD' && config?.keywords && config.keywords.length > 0) {
              const textToCheck = config.caseSensitive ? messageText : messageText.toLowerCase();
              const hasMatch = config.keywords.some((kw) => {
                const keyword = config.caseSensitive ? kw : kw.toLowerCase();
                return textToCheck.includes(keyword);
              });
              if (!hasMatch) continue;
            }

            const { data: newTrigger } = await supabase.from('triggers').insert({
              campaign_id: campaign.id,
              ig_user_id: senderId,
              ig_username: senderUsername,
              type: triggerType,
              source_id: msg.message?.mid || null,
              source_text: messageText,
              metadata: msg,
              status: 'PENDING',
            }).select('id').single();

            // Queue trigger for processing (non-blocking)
            if (newTrigger?.id) {
              triggerQueue.push(newTrigger.id);
            }
          }
        }
      }

      // Process comment events
      if (event.changes) {
        for (const change of event.changes) {
          if (change.field === 'comments') {
            const comment = change.value;
            const commentText = comment.text || '';
            const commenterId = comment.from?.id || '';
            const commenterUsername = comment.from?.username || commenterId || 'unknown';

            // Find matching COMMENT campaigns
            const matchingCampaigns = activeCampaigns.filter(
              (c) => c.trigger_type === 'COMMENT'
            );

            for (const campaign of matchingCampaigns) {
              // Check keyword matching if configured
              const config = campaign.trigger_config as { keywords?: string[]; caseSensitive?: boolean; postId?: string } | null;

              // If postId is set, only trigger for that specific post
              if (config?.postId && comment.media?.id !== config.postId) continue;

              // Check keyword matching
              if (config?.keywords && config.keywords.length > 0) {
                const textToCheck = config.caseSensitive ? commentText : commentText.toLowerCase();
                const hasMatch = config.keywords.some((kw) => {
                  const keyword = config.caseSensitive ? kw : kw.toLowerCase();
                  return textToCheck.includes(keyword);
                });
                if (!hasMatch) continue;
              }

              const { data: newTrigger } = await supabase.from('triggers').insert({
                campaign_id: campaign.id,
                ig_user_id: commenterId,
                ig_username: commenterUsername,
                type: 'COMMENT',
                source_id: comment.id || null,
                source_text: commentText,
                metadata: comment,
                status: 'PENDING',
              }).select('id').single();

              // Queue trigger for processing (non-blocking)
              if (newTrigger?.id) {
                triggerQueue.push(newTrigger.id);
              }
            }
          }

          // Process new follower events
          if (change.field === 'followers') {
            const followerData = change.value;
            const followerId = followerData.from?.id || '';
            const followerUsername = followerData.from?.username || followerId || 'unknown';

            // Find matching NEW_FOLLOWER campaigns
            const matchingCampaigns = activeCampaigns.filter(
              (c) => c.trigger_type === 'NEW_FOLLOWER'
            );

            for (const campaign of matchingCampaigns) {
              const { data: newTrigger } = await supabase.from('triggers').insert({
                campaign_id: campaign.id,
                ig_user_id: followerId,
                ig_username: followerUsername,
                type: 'NEW_FOLLOWER',
                source_id: null,
                source_text: '',
                metadata: followerData,
                status: 'PENDING',
              }).select('id').single();

              // Queue trigger for processing
              if (newTrigger?.id) {
                triggerQueue.push(newTrigger.id);
              }
            }
          }
        }
      }
    }

    // Process queued triggers immediately
    // We process before returning to ensure execution in serverless environment
    const processedTriggers = [];
    if (triggerQueue.length > 0) {
      const triggersToProcess = [...triggerQueue];
      triggerQueue.length = 0; // Clear queue

      for (const triggerId of triggersToProcess) {
        try {
          const result = await processTrigger(triggerId);
          processedTriggers.push({ triggerId, success: result.success, error: result.error });
          if (!result.success) {
            console.error(`Failed to process trigger ${triggerId}:`, result.error);
          }
        } catch (err) {
          console.error(`Error processing trigger ${triggerId}:`, err);
          processedTriggers.push({ triggerId, success: false, error: String(err) });
        }
      }
    }

    // Always return 200 to acknowledge receipt (Facebook requires this)
    return NextResponse.json({
      received: true,
      triggersProcessed: processedTriggers.length
    }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Facebook from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
