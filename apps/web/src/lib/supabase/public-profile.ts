import { supabase } from './client';
import {
  DatabaseError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from './database';
import {
  CreatePublicProfileSchema,
  UpdatePublicProfileSchema,
  UsernameSchema,
  formatZodErrors,
  type CreatePublicProfileInput,
  type UpdatePublicProfileInput,
  type PublicProfile,
  type DatabasePublicProfile,
} from '@/lib/validations';

type DbResult<T> = { data: T; error: null } | { data: null; error: DatabaseError };

async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AuthenticationError();
  }
  return user;
}

function handleSupabaseError(error: { message: string; code?: string }): DatabaseError {
  if (error.code === 'PGRST116') {
    return new NotFoundError('Public profile');
  }
  if (error.code === '23505') {
    return new DatabaseError('A profile with this username already exists', 'DUPLICATE');
  }
  if (error.code === '23503') {
    return new DatabaseError('Referenced record does not exist', 'FOREIGN_KEY');
  }
  if (error.code === '23514') {
    return new DatabaseError('Value violates constraint', 'CONSTRAINT');
  }
  return new DatabaseError(error.message, error.code);
}

function mapToPublicProfile(data: DatabasePublicProfile): PublicProfile {
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    avatarUrl: data.avatar_url,
    links: data.links,
    theme: data.theme,
    isPublished: data.is_published,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    viewCount: data.view_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export const publicProfileDb = {
  async get(): Promise<DbResult<PublicProfile>> {
    try {
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async getByUsername(username: string): Promise<DbResult<PublicProfile>> {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('is_published', true)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async create(input: CreatePublicProfileInput): Promise<DbResult<PublicProfile>> {
    try {
      const user = await getCurrentUser();

      const parsed = CreatePublicProfileSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid profile data', formatZodErrors(parsed.error)) };
      }

      const dbData = {
        user_id: user.id,
        username: parsed.data.username,
        display_name: parsed.data.displayName || null,
        bio: parsed.data.bio || null,
        avatar_url: parsed.data.avatarUrl || null,
        links: parsed.data.links,
        theme: parsed.data.theme,
        is_published: parsed.data.isPublished,
        seo_title: parsed.data.seoTitle || null,
        seo_description: parsed.data.seoDescription || null,
      };

      const { data, error } = await supabase
        .from('public_profiles')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async update(input: UpdatePublicProfileInput): Promise<DbResult<PublicProfile>> {
    try {
      const user = await getCurrentUser();

      const parsed = UpdatePublicProfileSchema.safeParse(input);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid profile data', formatZodErrors(parsed.error)) };
      }

      const updates: Record<string, unknown> = {};
      if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;
      if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
      if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;
      if (parsed.data.links !== undefined) updates.links = parsed.data.links;
      if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme;
      if (parsed.data.isPublished !== undefined) updates.is_published = parsed.data.isPublished;
      if (parsed.data.seoTitle !== undefined) updates.seo_title = parsed.data.seoTitle;
      if (parsed.data.seoDescription !== undefined) updates.seo_description = parsed.data.seoDescription;

      const { data, error } = await supabase
        .from('public_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async updateUsername(newUsername: string): Promise<DbResult<PublicProfile>> {
    try {
      const user = await getCurrentUser();

      const parsed = UsernameSchema.safeParse(newUsername);
      if (!parsed.success) {
        return { data: null, error: new ValidationError('Invalid username', formatZodErrors(parsed.error)) };
      }

      const { data, error } = await supabase
        .from('public_profiles')
        .update({ username: parsed.data })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async checkUsernameAvailability(username: string): Promise<DbResult<{ available: boolean; reason?: string }>> {
    try {
      const parsed = UsernameSchema.safeParse(username);
      if (!parsed.success) {
        const errors = formatZodErrors(parsed.error);
        const reason = Object.values(errors).flat()[0] || 'Invalid username format';
        return { data: { available: false, reason }, error: null };
      }

      const { data, error } = await supabase
        .from('public_profiles')
        .select('id')
        .eq('username', parsed.data)
        .maybeSingle();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return {
        data: {
          available: data === null,
          reason: data ? 'Username is already taken' : undefined,
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

  async togglePublished(): Promise<DbResult<PublicProfile>> {
    try {
      const user = await getCurrentUser();

      // Get current state
      const { data: current, error: getError } = await supabase
        .from('public_profiles')
        .select('is_published')
        .eq('user_id', user.id)
        .single();

      if (getError) {
        return { data: null, error: handleSupabaseError(getError) };
      }

      const { data, error } = await supabase
        .from('public_profiles')
        .update({ is_published: !current.is_published })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data: mapToPublicProfile(data as DatabasePublicProfile), error: null };
    } catch (err) {
      if (err instanceof DatabaseError) {
        return { data: null, error: err };
      }
      return { data: null, error: new DatabaseError((err as Error).message) };
    }
  },

  async delete(): Promise<DbResult<void>> {
    try {
      const user = await getCurrentUser();

      const { error } = await supabase
        .from('public_profiles')
        .delete()
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
};
