import { supabase } from './client';
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  CreateFlowSchema,
  UpdateFlowSchema,
  UpdateLeadSchema,
  AddLeadTagsSchema,
  CreateInstagramAccountSchema,
  LeadFiltersSchema,
  CampaignFiltersSchema,
  AnalyticsDateRangeSchema,
  toSnakeCase,
  toCamelCase,
  formatZodErrors,
  type CreateCampaignInput,
  type UpdateCampaignInput,
  type CreateFlowInput,
  type UpdateFlowInput,
  type UpdateLeadInput,
  type CreateInstagramAccountInput,
  type LeadFilters,
  type CampaignFilters,
  type AnalyticsDateRange,
  type DatabaseCampaign,
  type DatabaseFlow,
  type DatabaseLead,
  type DatabaseInstagramAccount,
  type PaginatedResponse,
  type CampaignStatus,
} from '@/lib/validations';

// ============================================
// ERROR HANDLING
// ============================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends DatabaseError {
  constructor(message: string = 'User not authenticated') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

type DbResult<T> = { data: T; error: null } | { data: null; error: DatabaseError };

async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AuthenticationError();
  }
  return user;
}

function handleSupabaseError(error: { message: string; code?: string }): DatabaseError {
  // Map common Supabase errors
  if (error.code === 'PGRST116') {
    return new NotFoundError('Resource');
  }
  if (error.code === '23505') {
    return new DatabaseError('A record with this value already exists', 'DUPLICATE');
  }
  if (error.code === '23503') {
    return new DatabaseError('Referenced record does not exist', 'FOREIGN_KEY');
  }
  if (error.code === '23514') {
    return new DatabaseError('Value violates constraint', 'CONSTRAINT');
  }
  return new DatabaseError(error.message, error.code);
}

// ============================================
// CAMPAIGNS
// ============================================

export const campaigns = {
  async list(filters?: CampaignFilters): Promise<DbResult<PaginatedResponse<DatabaseCampaign>>> {
    try {
      const user = await getCurrentUser();

      // Validate filters
      let page = 1, limit = 20, status, triggerType, instagramAccountId, search;
      if (filters) {
        const parsedFilters = CampaignFiltersSchema.safeParse(filters);
        if (!parsedFilters.success) {
          return { data: null, error: new ValidationError('Invalid filters', formatZodErrors(parsedFilters.error)) };
        }
        ({ page = 1, limit = 20, status, triggerType, instagramAccountId, search } = parsedFilters.data);
      }

      let query = supabase
        .from('campaigns')
        .select('*, instagram_account:instagram_accounts(id, username, profile_pic_url), flow:flows(id, name, is_valid), leads(count)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (triggerType) {
        query = query.eq('trigger_type', triggerType);
      }
      if (instagramAccountId) {
        query = query.eq('instagram_account_id', instagramAccountId);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: {
          data: data as DatabaseCampaign[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
          },
        },
        error: null,
      };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async get(id: string): Promise<DbResult<DatabaseCampaign>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('campaigns')
        .select('*, instagram_account:instagram_accounts(id, username, profile_pic_url), flow:flows(id, name, is_valid, nodes, edges)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseCampaign, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async create(input: CreateCampaignInput): Promise<DbResult<DatabaseCampaign>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = CreateCampaignSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid campaign data', formatZodErrors(parsed.error)) };
      }

      // Transform to snake_case for database
      const dbData = {
        user_id: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        instagram_account_id: parsed.data.instagramAccountId || null,
        trigger_type: parsed.data.triggerType,
        trigger_config: parsed.data.triggerConfig,
        flow_id: parsed.data.flowId || null,
        hourly_limit: parsed.data.hourlyLimit,
        daily_limit: parsed.data.dailyLimit,
        starts_at: parsed.data.startsAt?.toISOString() || null,
        ends_at: parsed.data.endsAt?.toISOString() || null,
        status: 'DRAFT',
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert(dbData)
        .select('*, instagram_account:instagram_accounts(id, username), flow:flows(id, name)')
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseCampaign, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async update(id: string, input: UpdateCampaignInput): Promise<DbResult<DatabaseCampaign>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = UpdateCampaignSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid campaign data', formatZodErrors(parsed.error)) };
      }

      // Build update object with snake_case keys
      const updates: Record<string, unknown> = {};
      if (parsed.data.name !== undefined) updates.name = parsed.data.name;
      if (parsed.data.description !== undefined) updates.description = parsed.data.description;
      if (parsed.data.instagramAccountId !== undefined) updates.instagram_account_id = parsed.data.instagramAccountId;
      if (parsed.data.triggerType !== undefined) updates.trigger_type = parsed.data.triggerType;
      if (parsed.data.triggerConfig !== undefined) updates.trigger_config = parsed.data.triggerConfig;
      if (parsed.data.flowId !== undefined) updates.flow_id = parsed.data.flowId;
      if (parsed.data.hourlyLimit !== undefined) updates.hourly_limit = parsed.data.hourlyLimit;
      if (parsed.data.dailyLimit !== undefined) updates.daily_limit = parsed.data.dailyLimit;
      if (parsed.data.startsAt !== undefined) updates.starts_at = parsed.data.startsAt?.toISOString() || null;
      if (parsed.data.endsAt !== undefined) updates.ends_at = parsed.data.endsAt?.toISOString() || null;
      if (parsed.data.status !== undefined) updates.status = parsed.data.status;

      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, instagram_account:instagram_accounts(id, username), flow:flows(id, name, is_valid)')
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseCampaign, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async delete(id: string): Promise<DbResult<void>> {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: undefined, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async activate(id: string): Promise<DbResult<DatabaseCampaign>> {
    try {
      const user = await getCurrentUser();

      // First, check if campaign can be activated using database function
      const { data: checkResult, error: checkError } = await supabase
        .rpc('can_activate_campaign', { campaign_id: id });

      if (checkError) {
        return { data: null, error: handleSupabaseError(checkError) };
      }

      const activationCheck = checkResult as { can_activate: boolean; errors: string[] };
      if (!activationCheck.can_activate) {
        return {
          data: null,
          error: new ValidationError(
            'Campaign cannot be activated',
            { activation: activationCheck.errors }
          ),
        };
      }

      // Activate the campaign
      return this.update(id, { status: 'ACTIVE' as CampaignStatus });
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async pause(id: string): Promise<DbResult<DatabaseCampaign>> {
    return this.update(id, { status: 'PAUSED' as CampaignStatus });
  },

  async archive(id: string): Promise<DbResult<DatabaseCampaign>> {
    return this.update(id, { status: 'ARCHIVED' as CampaignStatus });
  },
};

// ============================================
// FLOWS
// ============================================

export const flows = {
  async list(includeTemplates = false): Promise<DbResult<DatabaseFlow[]>> {
    try {
      const user = await getCurrentUser();

      let query = supabase
        .from('flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (includeTemplates) {
        query = query.or(`user_id.eq.${user.id},is_template.eq.true`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseFlow[], error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async get(id: string): Promise<DbResult<DatabaseFlow>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('id', id)
        .or(`user_id.eq.${user.id},is_template.eq.true`)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseFlow, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async create(input: CreateFlowInput): Promise<DbResult<DatabaseFlow>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = CreateFlowSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid flow data', formatZodErrors(parsed.error)) };
      }

      const dbData = {
        user_id: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        nodes: parsed.data.nodes,
        edges: parsed.data.edges,
        is_template: parsed.data.isTemplate,
      };

      const { data, error } = await supabase
        .from('flows')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseFlow, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async update(id: string, input: UpdateFlowInput): Promise<DbResult<DatabaseFlow>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = UpdateFlowSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid flow data', formatZodErrors(parsed.error)) };
      }

      // Build update object
      const updates: Record<string, unknown> = {};
      if (parsed.data.name !== undefined) updates.name = parsed.data.name;
      if (parsed.data.description !== undefined) updates.description = parsed.data.description;
      if (parsed.data.nodes !== undefined) updates.nodes = parsed.data.nodes;
      if (parsed.data.edges !== undefined) updates.edges = parsed.data.edges;
      if (parsed.data.isTemplate !== undefined) updates.is_template = parsed.data.isTemplate;

      const { data, error } = await supabase
        .from('flows')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseFlow, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async delete(id: string): Promise<DbResult<void>> {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: undefined, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async getTemplates(): Promise<DbResult<DatabaseFlow[]>> {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('is_template', true)
        .order('name');

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseFlow[], error: null };
    } catch (err) {
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async duplicateFromTemplate(templateId: string, name: string): Promise<DbResult<DatabaseFlow>> {
    try {
      const user = await getCurrentUser();

      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', templateId)
        .eq('is_template', true)
        .single();

      if (templateError) {
        return { data: null, error: handleSupabaseError(templateError) };
      }

      // Create a copy
      return this.create({
        name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
        isTemplate: false,
      });
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },
};

// ============================================
// LEADS
// ============================================

export const leads = {
  async list(filters?: LeadFilters): Promise<DbResult<PaginatedResponse<DatabaseLead>>> {
    try {
      const user = await getCurrentUser();

      // Validate filters
      let page = 1, limit = 20, search, tags, hasEmail, source, sourceCampaignId;
      if (filters) {
        const parsedFilters = LeadFiltersSchema.safeParse(filters);
        if (!parsedFilters.success) {
          return { data: null, error: new ValidationError('Invalid filters', formatZodErrors(parsedFilters.error)) };
        }
        ({ page = 1, limit = 20, search, tags, hasEmail, source, sourceCampaignId } = parsedFilters.data);
      }

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (search) {
        query = query.or(`ig_username.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`);
      }
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }
      if (hasEmail === true) {
        query = query.not('email', 'is', null);
      } else if (hasEmail === false) {
        query = query.is('email', null);
      }
      if (source) {
        query = query.eq('source', source);
      }
      if (sourceCampaignId) {
        query = query.eq('source_campaign_id', sourceCampaignId);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: {
          data: data as DatabaseLead[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
          },
        },
        error: null,
      };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async get(id: string): Promise<DbResult<DatabaseLead>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseLead, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async update(id: string, input: UpdateLeadInput): Promise<DbResult<DatabaseLead>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = UpdateLeadSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid lead data', formatZodErrors(parsed.error)) };
      }

      // Build update object
      const updates: Record<string, unknown> = {};
      if (parsed.data.email !== undefined) updates.email = parsed.data.email;
      if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
      if (parsed.data.name !== undefined) updates.name = parsed.data.name;
      if (parsed.data.customFields !== undefined) updates.custom_fields = parsed.data.customFields;
      if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;

      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseLead, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async addTags(id: string, newTags: string[]): Promise<DbResult<DatabaseLead>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = AddLeadTagsSchema.safeParse({ tags: newTags });
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid tags', formatZodErrors(parsed.error)) };
      }

      // Get current lead
      const { data: lead, error: getError } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (getError) {
        return { data: null, error: handleSupabaseError(getError) };
      }

      // Merge tags (use Set to avoid duplicates)
      const mergedTags = [...new Set([...(lead.tags || []), ...parsed.data.tags])];

      // Update with merged tags
      const { data, error } = await supabase
        .from('leads')
        .update({ tags: mergedTags })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseLead, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async removeTags(id: string, tagsToRemove: string[]): Promise<DbResult<DatabaseLead>> {
    try {
      const user = await getCurrentUser();

      // Get current lead
      const { data: lead, error: getError } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (getError) {
        return { data: null, error: handleSupabaseError(getError) };
      }

      // Filter out tags to remove
      const filteredTags = (lead.tags || []).filter((tag: string) => !tagsToRemove.includes(tag));

      // Update with filtered tags
      const { data, error } = await supabase
        .from('leads')
        .update({ tags: filteredTags })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseLead, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async delete(id: string): Promise<DbResult<void>> {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: undefined, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async export(filters?: LeadFilters): Promise<DbResult<DatabaseLead[]>> {
    try {
      const user = await getCurrentUser();

      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`ig_username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
      if (filters?.hasEmail === true) {
        query = query.not('email', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseLead[], error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },
};

// ============================================
// INSTAGRAM ACCOUNTS
// ============================================

export const instagramAccounts = {
  async list(): Promise<DbResult<DatabaseInstagramAccount[]>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('id, user_id, ig_user_id, username, name, profile_pic_url, token_expiry, is_active, last_synced_at, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseInstagramAccount[], error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async get(id: string): Promise<DbResult<DatabaseInstagramAccount>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('id, user_id, ig_user_id, username, name, profile_pic_url, token_expiry, is_active, last_synced_at, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseInstagramAccount, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async create(input: CreateInstagramAccountInput): Promise<DbResult<DatabaseInstagramAccount>> {
    try {
      const user = await getCurrentUser();

      // Validate input
      const parsed = CreateInstagramAccountSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid account data', formatZodErrors(parsed.error)) };
      }

      // Note: In production, you should encrypt the access token before storing
      // This would use the pgcrypto extension: pgp_sym_encrypt(token, key)
      const dbData = {
        user_id: user.id,
        ig_user_id: parsed.data.igUserId,
        username: parsed.data.username,
        profile_pic_url: parsed.data.profilePicUrl || null,
        // access_token_encrypted would be set via a server function with encryption
        token_expiry: parsed.data.tokenExpiry?.toISOString() || null,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('instagram_accounts')
        .insert(dbData)
        .select('id, user_id, ig_user_id, username, name, profile_pic_url, token_expiry, is_active, last_synced_at, created_at, updated_at')
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseInstagramAccount, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async delete(id: string): Promise<DbResult<void>> {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: undefined, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async deactivate(id: string): Promise<DbResult<DatabaseInstagramAccount>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('instagram_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, user_id, ig_user_id, username, name, profile_pic_url, token_expiry, is_active, last_synced_at, created_at, updated_at')
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: data as DatabaseInstagramAccount, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },
};

// ============================================
// ANALYTICS
// ============================================

export interface OverviewAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  leadsToday: number;
  totalTriggers: number;
  triggersToday: number;
  totalDmsSent: number;
  dmsSentToday: number;
  emailsCaptured: number;
}

export interface CampaignAnalyticsData {
  date: string;
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

export const analytics = {
  async overview(): Promise<DbResult<OverviewAnalytics>> {
    try {
      const user = await getCurrentUser();
      const today = new Date().toISOString().split('T')[0];

      // First get campaign IDs for the user
      const campaignsResult = await supabase
        .from('campaigns')
        .select('id, status')
        .eq('user_id', user.id);

      const campaignIds = (campaignsResult.data || []).map(c => c.id);

      // Run remaining queries in parallel
      const [leadsResult, leadsTodayResult, analyticsResult] = await Promise.all([
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`),
        campaignIds.length > 0
          ? supabase
              .from('campaign_analytics')
              .select('trigger_count, dms_sent, emails_captured')
              .in('campaign_id', campaignIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      // Calculate totals
      const campaigns = campaignsResult.data || [];
      const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;

      // Sum up analytics
      const analyticsData = analyticsResult.data || [];
      const totals = analyticsData.reduce(
        (acc, row) => ({
          triggers: acc.triggers + (row.trigger_count || 0),
          dms: acc.dms + (row.dms_sent || 0),
          emails: acc.emails + (row.emails_captured || 0),
        }),
        { triggers: 0, dms: 0, emails: 0 }
      );

      return {
        data: {
          totalCampaigns: campaigns.length,
          activeCampaigns,
          totalLeads: leadsResult.count || 0,
          leadsToday: leadsTodayResult.count || 0,
          totalTriggers: totals.triggers,
          triggersToday: 0, // Would need daily breakdown
          totalDmsSent: totals.dms,
          dmsSentToday: 0, // Would need daily breakdown
          emailsCaptured: totals.emails,
        },
        error: null,
      };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async campaign(campaignId: string, dateRange?: AnalyticsDateRange): Promise<DbResult<CampaignAnalyticsData>> {
    try {
      const user = await getCurrentUser();

      // Validate date range if provided
      if (dateRange) {
        const parsed = AnalyticsDateRangeSchema.safeParse(dateRange);
        if (!parsed.success) {
          return { data: null, error: new ValidationError('Invalid date range', formatZodErrors(parsed.error)) };
        }
      }

      // Verify campaign belongs to user
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (campaignError) {
        return { data: null, error: handleSupabaseError(campaignError) };
      }

      // Get analytics
      let query = supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: false });

      if (dateRange) {
        query = query
          .gte('date', dateRange.startDate.toISOString().split('T')[0])
          .lte('date', dateRange.endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      // Aggregate the data
      const aggregated = (data || []).reduce(
        (acc, row) => ({
          date: '', // not used
          triggerCount: acc.triggerCount + (row.trigger_count || 0),
          dmsSent: acc.dmsSent + (row.dms_sent || 0),
          dmsDelivered: acc.dmsDelivered + (row.dms_delivered || 0),
          dmsFailed: acc.dmsFailed + (row.dms_failed || 0),
          replies: acc.replies + (row.replies || 0),
          buttonClicks: acc.buttonClicks + (row.button_clicks || 0),
          linkClicks: acc.linkClicks + (row.link_clicks || 0),
          emailsCaptured: acc.emailsCaptured + (row.emails_captured || 0),
          flowCompletions: acc.flowCompletions + (row.flow_completions || 0),
          flowDropoffs: acc.flowDropoffs + (row.flow_dropoffs || 0),
        }),
        {
          date: '',
          triggerCount: 0,
          dmsSent: 0,
          dmsDelivered: 0,
          dmsFailed: 0,
          replies: 0,
          buttonClicks: 0,
          linkClicks: 0,
          emailsCaptured: 0,
          flowCompletions: 0,
          flowDropoffs: 0,
        }
      );

      return { data: aggregated, error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },
};

// ============================================
// USER PROFILE
// ============================================

export interface UserProfile {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  notificationPreferences: {
    emailNotifications: boolean;
    campaignAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    dmUpdates: boolean;
    newFeatures: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const userProfile = {
  async get(): Promise<DbResult<UserProfile>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          avatarUrl: data.avatar_url,
          timezone: data.timezone,
          language: data.language,
          notificationPreferences: data.notification_preferences,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async update(input: { name?: string; avatarUrl?: string; timezone?: string; language?: string; notificationPreferences?: Record<string, boolean> }): Promise<DbResult<UserProfile>> {
    try {
      const user = await getCurrentUser();

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;
      if (input.timezone !== undefined) updates.timezone = input.timezone;
      if (input.language !== undefined) updates.language = input.language;
      if (input.notificationPreferences !== undefined) updates.notification_preferences = input.notificationPreferences;

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          avatarUrl: data.avatar_url,
          timezone: data.timezone,
          language: data.language,
          notificationPreferences: data.notification_preferences,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        error: null,
      };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },
};

// ============================================
// EXPORT ALL
// ============================================

export const db = {
  campaigns,
  flows,
  leads,
  instagramAccounts,
  analytics,
  userProfile,
};
