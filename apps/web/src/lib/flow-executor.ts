/**
 * Flow Execution Engine
 *
 * Processes pending triggers and executes their associated flows.
 * Handles node traversal, message sending, delays, conditions, and captures.
 */

import { createClient } from '@supabase/supabase-js';

// Types
interface FlowNode {
  id: string;
  type: 'message' | 'button' | 'delay' | 'condition' | 'capture' | 'end';
  position: { x: number; y: number };
  data: {
    content?: string;
    personalization?: boolean;
    buttons?: Array<{
      id: string;
      label: string;
      type: 'reply' | 'url';
      value: string;
    }>;
    duration?: number;
    unit?: 'seconds' | 'minutes' | 'hours';
    variable?: string;
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
    value?: string;
    captureType?: 'email' | 'name' | 'phone' | 'custom';
    customField?: string;
    prompt?: string;
    closingMessage?: string;
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface Trigger {
  id: string;
  campaign_id: string;
  ig_user_id: string;
  ig_username: string;
  type: string;
  source_id: string;
  source_text: string;
  metadata: Record<string, unknown>;
  status: string;
  current_node_id: string | null;
  flow_state: Record<string, unknown>;
  lead_id: string | null;
}

interface Campaign {
  id: string;
  user_id: string;
  instagram_account_id: string;
  name: string;
  flow_id: string;
  trigger_config: {
    simpleAction?: 'send_dm' | 'reply_comment';
    simpleMessage?: string;
    keywords?: string[];
  } | null;
  hourly_limit: number;
  daily_limit: number;
  status: string;
}

interface InstagramAccount {
  id: string;
  ig_user_id: string;
  access_token: string;
}

// Create Supabase client with service role for background processing
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials for flow executor');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Process a single pending trigger
 */
export async function processTrigger(triggerId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  try {
    // 1. Fetch trigger with campaign and flow data
    const { data: trigger, error: triggerError } = await supabase
      .from('triggers')
      .select(`
        *,
        campaigns (
          id,
          user_id,
          instagram_account_id,
          name,
          flow_id,
          trigger_config,
          hourly_limit,
          daily_limit,
          status,
          flows (
            id,
            name,
            nodes,
            edges
          )
        )
      `)
      .eq('id', triggerId)
      .single();

    if (triggerError || !trigger) {
      return { success: false, error: 'Trigger not found' };
    }

    const campaign = trigger.campaigns as Campaign & { flows: Flow };
    const flow = campaign?.flows;
    const triggerConfig = campaign?.trigger_config;

    // Check if this is a simple action campaign (no flow needed)
    const hasSimpleAction = triggerConfig?.simpleAction && triggerConfig?.simpleMessage;
    const hasFlow = flow && flow.nodes && flow.nodes.length > 0;

    if (!hasSimpleAction && !hasFlow) {
      await updateTriggerStatus(supabase, triggerId, 'SKIPPED', 'No action configured');
      return { success: false, error: 'No action configured for campaign' };
    }

    // 2. Check rate limits
    const canProceed = await checkRateLimits(supabase, campaign);
    if (!canProceed) {
      await updateTriggerStatus(supabase, triggerId, 'SKIPPED', 'Rate limit exceeded');
      return { success: false, error: 'Rate limit exceeded' };
    }

    // 3. Get Instagram account for sending DMs
    const { data: igAccount } = await supabase
      .from('instagram_accounts')
      .select('id, ig_user_id, access_token')
      .eq('id', campaign.instagram_account_id)
      .single();

    if (!igAccount || !igAccount.access_token) {
      await updateTriggerStatus(supabase, triggerId, 'FAILED', 'Instagram account not configured');
      return { success: false, error: 'Instagram account not configured' };
    }

    // 4. Create or update lead
    const leadId = await upsertLead(supabase, trigger, campaign);
    if (leadId) {
      await supabase
        .from('triggers')
        .update({ lead_id: leadId })
        .eq('id', triggerId);
    }

    // 5. Mark trigger as processing
    await updateTriggerStatus(supabase, triggerId, 'PROCESSING');

    // 6. Handle simple action (no flow needed)
    if (hasSimpleAction && triggerConfig?.simpleMessage) {
      const result = await executeSimpleAction(
        supabase,
        trigger,
        igAccount,
        campaign,
        triggerConfig.simpleAction!,
        triggerConfig.simpleMessage
      );

      if (result.success) {
        await updateTriggerStatus(supabase, triggerId, 'COMPLETED');
        await incrementRateLimits(supabase, campaign);
        await updateAnalytics(supabase, campaign.id, { triggers: 1, dmsSent: 1, flowCompletions: 1 });
      } else {
        await updateTriggerStatus(supabase, triggerId, 'FAILED', result.error);
        await updateAnalytics(supabase, campaign.id, { triggers: 1, dmsFailed: 1 });
      }

      return result;
    }

    // 7. Execute flow (if configured)
    const result = await executeFlow(supabase, trigger, flow!, igAccount, campaign);

    // 8. Update trigger status based on result
    if (result.success) {
      await updateTriggerStatus(supabase, triggerId, 'COMPLETED');
      await incrementRateLimits(supabase, campaign);
      await updateAnalytics(supabase, campaign.id, { triggers: 1, flowCompletions: 1 });
    } else {
      await updateTriggerStatus(supabase, triggerId, 'FAILED', result.error);
      await updateAnalytics(supabase, campaign.id, { triggers: 1, flowDropoffs: 1 });
    }

    return result;
  } catch (error) {
    console.error('Error processing trigger:', error);
    await updateTriggerStatus(getSupabaseAdmin(), triggerId, 'FAILED',
      error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Execute a simple action (send DM or reply to comment)
 */
async function executeSimpleAction(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  trigger: Trigger,
  igAccount: InstagramAccount,
  campaign: Campaign,
  action: 'send_dm' | 'reply_comment',
  message: string
): Promise<{ success: boolean; error?: string }> {
  // Personalize the message
  const personalizedMessage = personalizeMessage(message, trigger);

  if (action === 'send_dm') {
    // Send DM to the user
    const result = await sendInstagramDM(igAccount, trigger.ig_user_id, personalizedMessage);

    if (result.success) {
      // Record the message
      await supabase.from('messages').insert({
        trigger_id: trigger.id,
        campaign_id: campaign.id,
        ig_user_id: trigger.ig_user_id,
        content: personalizedMessage,
        message_type: 'TEXT',
        status: 'SENT',
        ig_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      });
    }

    return result;
  } else if (action === 'reply_comment') {
    // Reply to the comment
    const commentId = trigger.source_id;
    if (!commentId) {
      return { success: false, error: 'No comment ID found' };
    }

    const result = await replyToComment(igAccount, commentId, personalizedMessage);

    if (result.success) {
      // Record the reply
      await supabase.from('messages').insert({
        trigger_id: trigger.id,
        campaign_id: campaign.id,
        ig_user_id: trigger.ig_user_id,
        content: personalizedMessage,
        message_type: 'COMMENT_REPLY',
        status: 'SENT',
        ig_message_id: result.commentId,
        sent_at: new Date().toISOString(),
      });
    }

    return result;
  }

  return { success: false, error: 'Unknown action type' };
}

/**
 * Reply to an Instagram comment
 */
async function replyToComment(
  igAccount: InstagramAccount,
  commentId: string,
  message: string
): Promise<{ success: boolean; error?: string; commentId?: string }> {
  try {
    // Use graph.instagram.com for Instagram Business Login tokens
    const response = await fetch(
      `https://graph.instagram.com/${commentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          message: message.slice(0, 1000),
          access_token: igAccount.access_token,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Comment reply failed:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to reply to comment'
      };
    }

    const data = await response.json();
    return { success: true, commentId: data.id };
  } catch (error) {
    console.error('Comment reply error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Execute a flow for a trigger
 */
async function executeFlow(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  trigger: Trigger,
  flow: Flow,
  igAccount: InstagramAccount,
  campaign: Campaign
): Promise<{ success: boolean; error?: string }> {
  const nodes = flow.nodes;
  const edges = flow.edges;

  // Find the starting node (node with no incoming edges or first message node)
  let currentNodeId = trigger.current_node_id || findStartNode(nodes, edges);
  let flowState = trigger.flow_state || {};

  if (!currentNodeId) {
    return { success: false, error: 'No starting node found in flow' };
  }

  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (currentNodeId && iterations < maxIterations) {
    iterations++;

    const currentNode = nodes.find(n => n.id === currentNodeId);
    if (!currentNode) {
      return { success: false, error: `Node ${currentNodeId} not found` };
    }

    // Execute the current node
    const nodeResult = await executeNode(
      supabase,
      currentNode,
      trigger,
      igAccount,
      campaign,
      flowState
    );

    if (!nodeResult.success) {
      return nodeResult;
    }

    // Update flow state
    flowState = { ...flowState, ...nodeResult.stateUpdates };

    // Save progress
    await supabase
      .from('triggers')
      .update({
        current_node_id: currentNodeId,
        flow_state: flowState
      })
      .eq('id', trigger.id);

    // Handle delay nodes - schedule continuation instead of blocking
    if (currentNode.type === 'delay' && nodeResult.delayMs) {
      // For now, we'll just wait (in production, use a job queue)
      await sleep(Math.min(nodeResult.delayMs, 60000)); // Max 1 minute wait inline
    }

    // If it's an end node, we're done
    if (currentNode.type === 'end') {
      return { success: true };
    }

    // Find next node
    const nextNodeId: string | null = nodeResult.nextNodeId || findNextNode(currentNodeId, edges, nodeResult.branchHandle);

    if (!nextNodeId) {
      // No more nodes, flow completed
      return { success: true };
    }

    currentNodeId = nextNodeId;
  }

  if (iterations >= maxIterations) {
    return { success: false, error: 'Flow exceeded maximum iterations' };
  }

  return { success: true };
}

/**
 * Execute a single flow node
 */
async function executeNode(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  node: FlowNode,
  trigger: Trigger,
  igAccount: InstagramAccount,
  campaign: Campaign,
  flowState: Record<string, unknown>
): Promise<{
  success: boolean;
  error?: string;
  stateUpdates?: Record<string, unknown>;
  nextNodeId?: string;
  branchHandle?: string;
  delayMs?: number;
}> {
  switch (node.type) {
    case 'message':
      return executeMessageNode(supabase, node, trigger, igAccount, campaign);

    case 'button':
      return executeButtonNode(supabase, node, trigger, igAccount, campaign);

    case 'delay':
      return executeDelayNode(node);

    case 'condition':
      return executeConditionNode(node, trigger, flowState);

    case 'capture':
      // Capture nodes require waiting for user input - for now, skip
      return { success: true, stateUpdates: {} };

    case 'end':
      if (node.data.closingMessage) {
        await sendInstagramDM(
          igAccount,
          trigger.ig_user_id,
          personalizeMessage(node.data.closingMessage, trigger)
        );
      }
      return { success: true };

    default:
      return { success: true };
  }
}

/**
 * Execute a message node - send DM
 */
async function executeMessageNode(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  node: FlowNode,
  trigger: Trigger,
  igAccount: InstagramAccount,
  campaign: Campaign
): Promise<{ success: boolean; error?: string }> {
  const content = node.data.content;
  if (!content) {
    return { success: true }; // Empty message, skip
  }

  const personalizedContent = node.data.personalization
    ? personalizeMessage(content, trigger)
    : content;

  const result = await sendInstagramDM(igAccount, trigger.ig_user_id, personalizedContent);

  if (result.success) {
    // Record the message
    await supabase.from('messages').insert({
      trigger_id: trigger.id,
      campaign_id: campaign.id,
      ig_user_id: trigger.ig_user_id,
      content: personalizedContent,
      message_type: 'TEXT',
      status: 'SENT',
      ig_message_id: result.messageId,
      sent_at: new Date().toISOString(),
    });

    await updateAnalytics(supabase, campaign.id, { dmsSent: 1 });
  }

  return result;
}

/**
 * Execute a button node - send DM with buttons
 */
async function executeButtonNode(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  node: FlowNode,
  trigger: Trigger,
  igAccount: InstagramAccount,
  campaign: Campaign
): Promise<{ success: boolean; error?: string }> {
  const content = node.data.content;
  const buttons = node.data.buttons;

  if (!content) {
    return { success: true };
  }

  // Instagram doesn't support buttons in regular DMs, send as text with options
  let messageContent = personalizeMessage(content, trigger);
  if (buttons && buttons.length > 0) {
    messageContent += '\n\n';
    buttons.forEach((btn, idx) => {
      if (btn.type === 'url') {
        messageContent += `${idx + 1}. ${btn.label}: ${btn.value}\n`;
      } else {
        messageContent += `${idx + 1}. Reply "${btn.label}"\n`;
      }
    });
  }

  const result = await sendInstagramDM(igAccount, trigger.ig_user_id, messageContent);

  if (result.success) {
    await supabase.from('messages').insert({
      trigger_id: trigger.id,
      campaign_id: campaign.id,
      ig_user_id: trigger.ig_user_id,
      content: messageContent,
      message_type: 'BUTTON',
      status: 'SENT',
      ig_message_id: result.messageId,
      sent_at: new Date().toISOString(),
    });

    await updateAnalytics(supabase, campaign.id, { dmsSent: 1 });
  }

  return result;
}

/**
 * Execute a delay node
 */
function executeDelayNode(node: FlowNode): { success: boolean; delayMs?: number } {
  const duration = node.data.duration || 0;
  const unit = node.data.unit || 'seconds';

  let delayMs = duration * 1000; // Default to seconds
  if (unit === 'minutes') delayMs = duration * 60 * 1000;
  if (unit === 'hours') delayMs = duration * 60 * 60 * 1000;

  return { success: true, delayMs };
}

/**
 * Execute a condition node - determine branch
 */
function executeConditionNode(
  node: FlowNode,
  trigger: Trigger,
  flowState: Record<string, unknown>
): { success: boolean; branchHandle?: string } {
  const variable = node.data.variable;
  const operator = node.data.operator;
  const value = node.data.value || '';

  // Get variable value from trigger or flow state
  let varValue = '';
  if (variable === 'message') {
    varValue = trigger.source_text || '';
  } else if (variable === 'username') {
    varValue = trigger.ig_username || '';
  } else if (variable) {
    varValue = String(flowState[variable] || '');
  }

  let conditionMet = false;
  switch (operator) {
    case 'equals':
      conditionMet = varValue.toLowerCase() === value.toLowerCase();
      break;
    case 'contains':
      conditionMet = varValue.toLowerCase().includes(value.toLowerCase());
      break;
    case 'startsWith':
      conditionMet = varValue.toLowerCase().startsWith(value.toLowerCase());
      break;
    case 'endsWith':
      conditionMet = varValue.toLowerCase().endsWith(value.toLowerCase());
      break;
    case 'isEmpty':
      conditionMet = !varValue || varValue.trim() === '';
      break;
    case 'isNotEmpty':
      conditionMet = !!varValue && varValue.trim() !== '';
      break;
  }

  return {
    success: true,
    branchHandle: conditionMet ? 'true' : 'false'
  };
}

/**
 * Send Instagram DM via Graph API
 */
async function sendInstagramDM(
  igAccount: InstagramAccount,
  recipientId: string,
  message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${igAccount.access_token}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message.slice(0, 1000) },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'Failed to send DM'
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.message_id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Personalize message content with trigger data
 */
function personalizeMessage(content: string, trigger: Trigger): string {
  return content
    .replace(/\{\{username\}\}/gi, trigger.ig_username || 'there')
    .replace(/\{\{name\}\}/gi, trigger.ig_username || 'there')
    .replace(/\{\{message\}\}/gi, trigger.source_text || '');
}

/**
 * Find the starting node of a flow
 */
function findStartNode(nodes: FlowNode[], edges: FlowEdge[]): string | null {
  // Find nodes that are not targets of any edge
  const targetIds = new Set(edges.map(e => e.target));
  const startNodes = nodes.filter(n => !targetIds.has(n.id));

  // Prefer message nodes as start
  const messageStart = startNodes.find(n => n.type === 'message');
  if (messageStart) return messageStart.id;

  // Otherwise, return first non-end node
  const nonEndStart = startNodes.find(n => n.type !== 'end');
  if (nonEndStart) return nonEndStart.id;

  // Fallback to first node
  return nodes[0]?.id || null;
}

/**
 * Find the next node in the flow
 */
function findNextNode(currentId: string, edges: FlowEdge[], branchHandle?: string): string | null {
  const outgoingEdges = edges.filter(e => e.source === currentId);

  if (outgoingEdges.length === 0) return null;

  // If branch handle specified, find matching edge
  if (branchHandle) {
    const branchEdge = outgoingEdges.find(e => e.sourceHandle === branchHandle);
    if (branchEdge) return branchEdge.target;
  }

  // Return first outgoing edge target
  return outgoingEdges[0].target;
}

/**
 * Create or update lead record
 */
async function upsertLead(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  trigger: Trigger,
  campaign: Campaign
): Promise<string | null> {
  try {
    // Check if lead exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, total_interactions')
      .eq('user_id', campaign.user_id)
      .eq('ig_user_id', trigger.ig_user_id)
      .single();

    if (existingLead) {
      // Update existing lead
      await supabase
        .from('leads')
        .update({
          last_interaction_at: new Date().toISOString(),
          total_interactions: (existingLead.total_interactions || 0) + 1,
        })
        .eq('id', existingLead.id);

      return existingLead.id;
    }

    // Create new lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        user_id: campaign.user_id,
        ig_user_id: trigger.ig_user_id,
        ig_username: trigger.ig_username,
        source: trigger.type,
        source_campaign_id: campaign.id,
        first_interaction_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        total_interactions: 1,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create lead:', error);
      return null;
    }

    return newLead?.id || null;
  } catch (error) {
    console.error('Error upserting lead:', error);
    return null;
  }
}

/**
 * Check rate limits for campaign
 */
async function checkRateLimits(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  campaign: Campaign
): Promise<boolean> {
  try {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const todayStart = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z').toISOString();

    // Count triggers in last hour
    const { count: hourlyCount } = await supabase
      .from('triggers')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .in('status', ['COMPLETED', 'PROCESSING'])
      .gte('created_at', hourAgo);

    if ((hourlyCount || 0) >= campaign.hourly_limit) {
      return false;
    }

    // Count triggers today
    const { count: dailyCount } = await supabase
      .from('triggers')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id)
      .in('status', ['COMPLETED', 'PROCESSING'])
      .gte('created_at', todayStart);

    if ((dailyCount || 0) >= campaign.daily_limit) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow processing if rate limit check fails
    return true;
  }
}

/**
 * Increment rate limit counters (no-op, rate limits checked via query)
 */
async function incrementRateLimits(
  _supabase: ReturnType<typeof getSupabaseAdmin>,
  _campaign: Campaign
): Promise<void> {
  // Rate limits are now checked by counting triggers directly
}

/**
 * Update trigger status
 */
async function updateTriggerStatus(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  triggerId: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }
  if (status === 'COMPLETED' || status === 'FAILED') {
    updateData.processed_at = new Date().toISOString();
  }

  await supabase
    .from('triggers')
    .update(updateData)
    .eq('id', triggerId);
}

/**
 * Update campaign analytics
 */
async function updateAnalytics(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  campaignId: string,
  updates: {
    triggers?: number;
    dmsSent?: number;
    dmsDelivered?: number;
    dmsFailed?: number;
    leadsCreated?: number;
    flowCompletions?: number;
    flowDropoffs?: number;
  }
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Upsert analytics record
    const { data: existing } = await supabase
      .from('campaign_analytics')
      .select('id, trigger_count, dms_sent, dms_delivered, dms_failed, flow_completions, flow_dropoffs')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing record by incrementing values
      await supabase
        .from('campaign_analytics')
        .update({
          trigger_count: (existing.trigger_count || 0) + (updates.triggers || 0),
          dms_sent: (existing.dms_sent || 0) + (updates.dmsSent || 0),
          dms_delivered: (existing.dms_delivered || 0) + (updates.dmsDelivered || 0),
          dms_failed: (existing.dms_failed || 0) + (updates.dmsFailed || 0),
          flow_completions: (existing.flow_completions || 0) + (updates.flowCompletions || 0),
          flow_dropoffs: (existing.flow_dropoffs || 0) + (updates.flowDropoffs || 0),
        })
        .eq('id', existing.id);
    } else {
      // Insert new record
      await supabase.from('campaign_analytics').insert({
        campaign_id: campaignId,
        date: today,
        trigger_count: updates.triggers || 0,
        dms_sent: updates.dmsSent || 0,
        dms_delivered: updates.dmsDelivered || 0,
        dms_failed: updates.dmsFailed || 0,
        flow_completions: updates.flowCompletions || 0,
        flow_dropoffs: updates.flowDropoffs || 0,
      });
    }
  } catch (error) {
    // Don't fail the trigger if analytics update fails
    console.error('Analytics update failed:', error);
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process all pending triggers for a campaign
 */
export async function processPendingTriggers(campaignId?: string): Promise<{ processed: number; failed: number }> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('triggers')
    .select('id')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
    .limit(50);

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data: triggers, error } = await query;

  if (error || !triggers) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const trigger of triggers) {
    const result = await processTrigger(trigger.id);
    if (result.success) {
      processed++;
    } else {
      failed++;
    }
  }

  return { processed, failed };
}
