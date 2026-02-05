import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processTrigger } from '@/lib/flow-executor';

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Queue to process triggers asynchronously (non-blocking)
const triggerQueue: string[] = [];

/**
 * Webhook verification (GET) - Facebook sends a GET request to verify the webhook.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * Webhook event handler (POST) - receives Instagram events:
 * - comments on posts
 * - story replies
 * - DM messages
 * - new followers
 */
export async function POST(request: NextRequest) {
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
