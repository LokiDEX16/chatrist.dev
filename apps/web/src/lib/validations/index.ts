import { z } from 'zod';

// Re-export public profile validations
export * from './public-profile';

// ============================================
// ENUMS
// ============================================

export const CampaignStatus = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']);
export type CampaignStatus = z.infer<typeof CampaignStatus>;

export const TriggerType = z.enum(['COMMENT', 'STORY_REPLY', 'DM_KEYWORD', 'NEW_FOLLOWER']);
export type TriggerType = z.infer<typeof TriggerType>;

export const TriggerStatus = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED']);
export type TriggerStatus = z.infer<typeof TriggerStatus>;

export const MessageType = z.enum(['TEXT', 'BUTTON', 'LINK', 'IMAGE']);
export type MessageType = z.infer<typeof MessageType>;

export const MessageStatus = z.enum(['QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED']);
export type MessageStatus = z.infer<typeof MessageStatus>;

export const FlowNodeType = z.enum(['message', 'button', 'delay', 'condition', 'capture', 'end']);
export type FlowNodeType = z.infer<typeof FlowNodeType>;

// ============================================
// COMMON SCHEMAS
// ============================================

export const UUIDSchema = z.string().uuid('Invalid UUID format');

export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// ============================================
// TRIGGER CONFIG SCHEMAS
// ============================================

export const TriggerConfigSchema = z.object({
  keywords: z.array(z.string().min(1).max(50)).max(20).optional(),
  emojis: z.array(z.string()).max(10).optional(),
  matchAll: z.boolean().optional().default(false),
  caseSensitive: z.boolean().optional().default(false),
  postId: z.string().optional(), // For COMMENT triggers on specific posts
  excludeKeywords: z.array(z.string().min(1).max(50)).max(20).optional(),
});

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

// ============================================
// FLOW NODE SCHEMAS
// ============================================

const FlowNodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const MessageNodeDataSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters'),
  personalization: z.boolean().default(false),
});

const ButtonOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Button label is required').max(20, 'Button label must be less than 20 characters'),
  type: z.enum(['reply', 'url']),
  value: z.string().optional(),
});

const ButtonNodeDataSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  buttons: z.array(ButtonOptionSchema).min(1, 'At least one button is required').max(3, 'Maximum 3 buttons allowed'),
});

const DelayNodeDataSchema = z.object({
  duration: z.number().int().min(1, 'Duration must be at least 1').max(86400, 'Maximum delay is 24 hours'),
  unit: z.enum(['seconds', 'minutes', 'hours']),
});

const ConditionNodeDataSchema = z.object({
  variable: z.string().min(1, 'Variable is required'),
  operator: z.enum(['equals', 'contains', 'exists', 'not_equals', 'not_contains']),
  value: z.string(),
});

const CaptureNodeDataSchema = z.object({
  field: z.enum(['email', 'name', 'phone', 'custom']),
  customFieldName: z.string().max(50).optional(),
  validationType: z.enum(['email', 'phone', 'none']).optional().default('none'),
  promptMessage: z.string().min(1, 'Prompt message is required').max(500, 'Prompt must be less than 500 characters'),
  retryMessage: z.string().max(500).optional(),
  maxRetries: z.number().int().min(0).max(3).optional().default(1),
});

const EndNodeDataSchema = z.object({
  message: z.string().max(1000).optional(),
});

export const FlowNodeDataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message'), ...MessageNodeDataSchema.shape }),
  z.object({ type: z.literal('button'), ...ButtonNodeDataSchema.shape }),
  z.object({ type: z.literal('delay'), ...DelayNodeDataSchema.shape }),
  z.object({ type: z.literal('condition'), ...ConditionNodeDataSchema.shape }),
  z.object({ type: z.literal('capture'), ...CaptureNodeDataSchema.shape }),
  z.object({ type: z.literal('end'), ...EndNodeDataSchema.shape }),
]);

export const FlowNodeSchema = z.object({
  id: z.string().min(1),
  type: FlowNodeType,
  position: FlowNodePositionSchema,
  data: z.record(z.unknown()), // Flexible for now, validated separately
});

export const FlowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  label: z.string().optional(),
});

export type FlowNode = z.infer<typeof FlowNodeSchema>;
export type FlowEdge = z.infer<typeof FlowEdgeSchema>;

// ============================================
// FLOW SCHEMAS
// ============================================

export const CreateFlowSchema = z.object({
  name: z
    .string()
    .min(1, 'Flow name is required')
    .max(100, 'Flow name must be less than 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  nodes: z.array(FlowNodeSchema).max(50, 'Maximum 50 nodes allowed').default([]),
  edges: z.array(FlowEdgeSchema).max(100, 'Maximum 100 edges allowed').default([]),
  isTemplate: z.boolean().default(false),
});

export const UpdateFlowSchema = CreateFlowSchema.partial();

export type CreateFlowInput = z.infer<typeof CreateFlowSchema>;
export type UpdateFlowInput = z.infer<typeof UpdateFlowSchema>;

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

export const CreateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  instagramAccountId: UUIDSchema.optional(),
  triggerType: TriggerType,
  triggerConfig: TriggerConfigSchema.optional().default({}),
  flowId: UUIDSchema.optional(),
  hourlyLimit: z
    .number()
    .int()
    .min(1, 'Hourly limit must be at least 1')
    .max(50, 'Hourly limit cannot exceed 50')
    .default(20),
  dailyLimit: z
    .number()
    .int()
    .min(1, 'Daily limit must be at least 1')
    .max(500, 'Daily limit cannot exceed 500')
    .default(100),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
}).refine(
  (data) => data.hourlyLimit <= data.dailyLimit,
  {
    message: 'Hourly limit cannot exceed daily limit',
    path: ['hourlyLimit'],
  }
).refine(
  (data) => {
    if (data.startsAt && data.endsAt) {
      return data.endsAt > data.startsAt;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endsAt'],
  }
);

export const UpdateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string().max(500).optional(),
  instagramAccountId: UUIDSchema.optional(),
  triggerType: TriggerType.optional(),
  triggerConfig: TriggerConfigSchema.optional(),
  flowId: UUIDSchema.nullable().optional(),
  hourlyLimit: z.number().int().min(1).max(50).optional(),
  dailyLimit: z.number().int().min(1).max(500).optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  status: CampaignStatus.optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;

// ============================================
// LEAD SCHEMAS
// ============================================

export const CreateLeadSchema = z.object({
  igUserId: z.string().min(1, 'Instagram user ID is required'),
  igUsername: z.string().min(1, 'Instagram username is required'),
  email: EmailSchema.optional(),
  phone: z.string().max(20).optional(),
  name: z.string().max(100).optional(),
  customFields: z.record(z.string()).optional().default({}),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  source: z.string().max(100).optional(),
  sourceCampaignId: UUIDSchema.optional(),
});

export const UpdateLeadSchema = z.object({
  email: EmailSchema.optional(),
  phone: z.string().max(20).optional(),
  name: z.string().max(100).optional(),
  customFields: z.record(z.string()).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const AddLeadTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).min(1, 'At least one tag is required').max(20),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type AddLeadTagsInput = z.infer<typeof AddLeadTagsSchema>;

// ============================================
// INSTAGRAM ACCOUNT SCHEMAS
// ============================================

export const CreateInstagramAccountSchema = z.object({
  igUserId: z.string().min(1, 'Instagram user ID is required'),
  username: z.string().min(1, 'Username is required'),
  profilePicUrl: z.string().url().optional(),
  accessToken: z.string().min(1, 'Access token is required'),
  tokenExpiry: z.coerce.date().optional(),
});

export type CreateInstagramAccountInput = z.infer<typeof CreateInstagramAccountSchema>;

// ============================================
// USER PROFILE SCHEMAS
// ============================================

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().max(50).optional(),
  language: z.string().length(2).optional(),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().optional(),
    campaignAlerts: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    monthlyReports: z.boolean().optional(),
    dmUpdates: z.boolean().optional(),
    newFeatures: z.boolean().optional(),
  }).optional(),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;

// ============================================
// AUTH SCHEMAS
// ============================================

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: EmailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================
// FILTER/SEARCH SCHEMAS
// ============================================

export const LeadFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  hasEmail: z.boolean().optional(),
  source: z.string().optional(),
  sourceCampaignId: UUIDSchema.optional(),
  ...PaginationSchema.shape,
});

export const CampaignFiltersSchema = z.object({
  status: CampaignStatus.optional(),
  triggerType: TriggerType.optional(),
  instagramAccountId: UUIDSchema.optional(),
  search: z.string().max(100).optional(),
  ...PaginationSchema.shape,
});

export const AnalyticsDateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be after or equal to start date' }
);

export type LeadFilters = z.infer<typeof LeadFiltersSchema>;
export type CampaignFilters = z.infer<typeof CampaignFiltersSchema>;
export type AnalyticsDateRange = z.infer<typeof AnalyticsDateRangeSchema>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// DATABASE TYPES (for Supabase)
// ============================================

export interface DatabaseCampaign {
  id: string;
  user_id: string;
  instagram_account_id: string | null;
  name: string;
  description: string | null;
  status: CampaignStatus;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig;
  flow_id: string | null;
  hourly_limit: number;
  daily_limit: number;
  hourly_count: number;
  daily_count: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFlow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  is_template: boolean;
  is_valid: boolean;
  validation_errors: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseLead {
  id: string;
  user_id: string;
  ig_user_id: string;
  ig_username: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  custom_fields: Record<string, string>;
  tags: string[];
  source: string | null;
  source_campaign_id: string | null;
  first_interaction_at: string;
  last_interaction_at: string;
  total_interactions: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInstagramAccount {
  id: string;
  user_id: string;
  ig_user_id: string;
  username: string;
  name: string | null;
  profile_pic_url: string | null;
  token_expiry: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

export function toCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

export function validateAndTransform<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  return errors;
}
