// Message Types

export enum MessageType {
  TEXT = 'TEXT',
  BUTTON = 'BUTTON',
  LINK = 'LINK',
  IMAGE = 'IMAGE',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum TriggerStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface Message {
  id: string;
  triggerId: string;
  campaignId: string;
  igUserId: string;
  content: string;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
  status: MessageStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount: number;
  igMessageId?: string;
  createdAt: Date;
}

export interface Trigger {
  id: string;
  campaignId: string;
  leadId?: string;
  igUserId: string;
  igUsername: string;
  type: string;
  sourceId?: string;
  sourceText?: string;
  metadata?: Record<string, unknown>;
  status: TriggerStatus;
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: Date;
  currentNodeId?: string;
  flowState?: Record<string, unknown>;
  createdAt: Date;
}

export interface QueuedMessage {
  campaignId: string;
  triggerId: string;
  igUserId: string;
  content: string;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
  priority: number;
  scheduledFor?: Date;
}
