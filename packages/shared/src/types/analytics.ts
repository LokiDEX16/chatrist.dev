// Analytics Types

export interface CampaignAnalytics {
  id: string;
  campaignId: string;
  date: Date;
  triggerCount: number;
  dmsSent: number;
  dmsDelivered: number;
  dmsFailed: number;
  replies: number;
  buttonClicks: number;
  linkClicks: number;
  emailsCaptured: number;
  flowCompletions: number;
  flowDropoffs: number;
}

export interface AnalyticsOverview {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTriggers: number;
  triggersToday: number;
  totalDmsSent: number;
  dmsSentToday: number;
  totalLeads: number;
  leadsToday: number;
  emailsCaptured: number;
}

export interface ActivityItem {
  id: string;
  type: 'trigger' | 'dm_sent' | 'lead_captured' | 'flow_completed';
  campaignId: string;
  campaignName: string;
  igUsername?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CampaignStats {
  campaignId: string;
  totalTriggers: number;
  totalDmsSent: number;
  deliveryRate: number;
  replyRate: number;
  conversionRate: number;
  dailyStats: DailyStat[];
}

export interface DailyStat {
  date: string;
  triggers: number;
  dmsSent: number;
  replies: number;
  conversions: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}
