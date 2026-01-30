// Campaign Types

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TriggerType {
  COMMENT = 'COMMENT',
  STORY_REPLY = 'STORY_REPLY',
  DM_KEYWORD = 'DM_KEYWORD',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
}

export interface TriggerConfig {
  keywords?: string[];
  emojis?: string[];
  matchAll?: boolean;
  caseSensitive?: boolean;
  postId?: string;
  excludeKeywords?: string[];
}

export interface Campaign {
  id: string;
  userId: string;
  instagramAccountId?: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  triggerType: TriggerType;
  triggerConfig: TriggerConfig;
  flowId?: string;
  hourlyLimit: number;
  dailyLimit: number;
  hourlyCount: number;
  dailyCount: number;
  leadsCount: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  instagramAccount?: {
    id: string;
    username: string;
    profilePicUrl?: string;
  } | null;
  flow?: {
    id: string;
    name: string;
    isValid: boolean;
  } | null;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  instagramAccountId?: string;
  triggerType: TriggerType;
  triggerConfig?: TriggerConfig;
  flowId?: string;
  hourlyLimit?: number;
  dailyLimit?: number;
  startsAt?: Date;
  endsAt?: Date;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  instagramAccountId?: string;
  triggerType?: TriggerType;
  triggerConfig?: TriggerConfig;
  flowId?: string;
  hourlyLimit?: number;
  dailyLimit?: number;
  startsAt?: Date;
  endsAt?: Date;
  status?: CampaignStatus;
}
