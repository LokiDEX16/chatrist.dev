/**
 * API Layer
 *
 * This module provides API functions that use the Supabase database layer directly.
 * No external backend server is required - all operations go through Supabase.
 *
 * For Instagram operations, we use Next.js API routes that handle OAuth
 * and communicate with the Meta Graph API.
 */

import { db, DatabaseError, ValidationError, AuthenticationError, NotFoundError } from '@/lib/supabase/database';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateFlowInput,
  UpdateFlowInput,
  UpdateLeadInput,
  LeadFilters,
  CampaignFilters,
  AnalyticsDateRange,
} from '@/lib/validations';

// Re-export database layer for direct access
export { db };

// Re-export error types
export { DatabaseError, ValidationError, AuthenticationError, NotFoundError };

// ============================================
// CAMPAIGN API
// ============================================

export const campaignApi = {
  list: (filters?: CampaignFilters) => db.campaigns.list(filters),
  get: (id: string) => db.campaigns.get(id),
  create: (data: CreateCampaignInput) => db.campaigns.create(data),
  update: (id: string, data: UpdateCampaignInput) => db.campaigns.update(id, data),
  delete: (id: string) => db.campaigns.delete(id),
  activate: (id: string) => db.campaigns.activate(id),
  pause: (id: string) => db.campaigns.pause(id),
  archive: (id: string) => db.campaigns.archive(id),
};

// ============================================
// FLOW API
// ============================================

export const flowApi = {
  list: (includeTemplates = false) => db.flows.list(includeTemplates),
  get: (id: string) => db.flows.get(id),
  create: (data: CreateFlowInput) => db.flows.create(data),
  update: (id: string, data: UpdateFlowInput) => db.flows.update(id, data),
  delete: (id: string) => db.flows.delete(id),
  templates: () => db.flows.getTemplates(),
  duplicateFromTemplate: (templateId: string, name: string) =>
    db.flows.duplicateFromTemplate(templateId, name),
};

// ============================================
// LEAD API
// ============================================

export const leadApi = {
  list: (filters?: LeadFilters) => db.leads.list(filters),
  get: (id: string) => db.leads.get(id),
  update: (id: string, data: UpdateLeadInput) => db.leads.update(id, data),
  delete: (id: string) => db.leads.delete(id),
  addTags: (id: string, tags: string[]) => db.leads.addTags(id, tags),
  removeTags: (id: string, tags: string[]) => db.leads.removeTags(id, tags),
  export: (filters?: LeadFilters) => db.leads.export(filters),
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  overview: () => db.analytics.overview(),
  campaign: (id: string, dateRange?: AnalyticsDateRange) =>
    db.analytics.campaign(id, dateRange),
};

// ============================================
// INSTAGRAM API (via Next.js API routes)
// ============================================

interface InstagramAccount {
  id: string;
  igUserId: string;
  username: string;
  profilePicUrl?: string;
  isActive: boolean;
  tokenExpiry?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: result.error?.message || result.message || 'Request failed',
          code: result.error?.code || String(response.status),
        },
      };
    }

    return { data: result.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

export const instagramApi = {
  /**
   * Get list of connected Instagram accounts
   */
  accounts: async (): Promise<ApiResponse<InstagramAccount[]>> => {
    // Use database layer directly for account listing
    const { data, error } = await db.instagramAccounts.list();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    // Transform to expected format
    const accounts: InstagramAccount[] = (data || []).map((acc) => ({
      id: acc.id,
      igUserId: acc.ig_user_id,
      username: acc.username,
      profilePicUrl: acc.profile_pic_url || undefined,
      isActive: acc.is_active,
      tokenExpiry: acc.token_expiry || undefined,
    }));

    return { data: accounts, error: null };
  },

  /**
   * Initiate OAuth connection flow
   * Returns the URL to redirect the user to
   */
  connect: async (): Promise<ApiResponse<{ url: string }>> => {
    return fetchApi<{ url: string }>('/api/instagram/connect');
  },

  /**
   * Start the OAuth redirect
   */
  startConnect: () => {
    window.location.href = '/api/instagram/connect';
  },

  /**
   * Disconnect an Instagram account
   */
  disconnect: async (id: string): Promise<ApiResponse<void>> => {
    const { error } = await db.instagramAccounts.delete(id);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: undefined, error: null };
  },

  /**
   * Refresh an Instagram account's access token
   */
  refresh: async (id: string): Promise<ApiResponse<InstagramAccount>> => {
    return fetchApi<InstagramAccount>(`/api/instagram/accounts/${id}/refresh`, {
      method: 'POST',
    });
  },

  /**
   * Deactivate an Instagram account (keep in DB but mark inactive)
   */
  deactivate: async (id: string): Promise<ApiResponse<InstagramAccount>> => {
    const { data, error } = await db.instagramAccounts.deactivate(id);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return {
      data: data ? {
        id: data.id,
        igUserId: data.ig_user_id,
        username: data.username,
        profilePicUrl: data.profile_pic_url || undefined,
        isActive: data.is_active,
        tokenExpiry: data.token_expiry || undefined,
      } : null,
      error: null,
    };
  },
};

// ============================================
// USER API
// ============================================

export const userApi = {
  /**
   * Get user profile
   */
  getProfile: () => db.userProfile.get(),

  /**
   * Update user profile
   */
  updateProfile: (data: {
    name?: string;
    avatarUrl?: string;
    timezone?: string;
    language?: string;
  }) => db.userProfile.update(data),

  /**
   * Update notification preferences
   */
  updateNotifications: (preferences: {
    emailNotifications?: boolean;
    campaignAlerts?: boolean;
    weeklyReports?: boolean;
    monthlyReports?: boolean;
    dmUpdates?: boolean;
    newFeatures?: boolean;
  }) => db.userProfile.update({ notificationPreferences: preferences }),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Helper to handle API errors consistently
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DatabaseError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

/**
 * Helper to check if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Helper to check if an error is an authentication error
 */
export function isAuthError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Helper to check if an error is a not found error
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Helper to format validation errors for display
 */
export function formatValidationErrors(error: ValidationError): Record<string, string> {
  const formatted: Record<string, string> = {};

  if (error.details) {
    for (const [key, messages] of Object.entries(error.details)) {
      formatted[key] = messages.join(', ');
    }
  }

  return formatted;
}
