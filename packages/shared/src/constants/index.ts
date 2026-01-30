// Rate Limiting Constants
export const RATE_LIMITS = {
  DEFAULT_HOURLY: 20,
  DEFAULT_DAILY: 100,
  MAX_HOURLY: 50,
  MAX_DAILY: 500,
  BURST_SIZE: 5,
  BURST_WINDOW_MS: 60000, // 1 minute
} as const;

// Queue Constants
export const QUEUE_NAMES = {
  DM_SEND: 'dm-send',
  TRIGGER_PROCESS: 'trigger-process',
  ANALYTICS: 'analytics',
  CLEANUP: 'cleanup',
} as const;

// Job Priorities
export const JOB_PRIORITY = {
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
} as const;

// Flow Constants
export const FLOW_LIMITS = {
  MAX_NODES: 50,
  MAX_EDGES: 100,
  MAX_BUTTON_OPTIONS: 3,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_DELAY_HOURS: 24,
} as const;

// Personalization Variables
export const PERSONALIZATION_VARS = {
  USERNAME: '{{username}}',
  FIRST_NAME: '{{first_name}}',
  FULL_NAME: '{{full_name}}',
} as const;

// Instagram API Constants
export const INSTAGRAM = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_BUTTONS: 3,
  WEBHOOK_EVENTS: ['messages', 'messaging_postbacks', 'comments', 'mentions'],
} as const;

// Validation Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
} as const;
