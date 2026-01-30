import { supabase } from './client';
import { LoginSchema, RegisterSchema, UpdatePasswordSchema, type LoginInput, type RegisterInput, type UpdatePasswordInput } from '@/lib/validations';
import { AuthError as SupabaseAuthError, User, Session } from '@supabase/supabase-js';

// ============================================
// ERROR HANDLING
// ============================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

type AuthResult<T> = { data: T; error: null } | { data: null; error: AuthError };

function handleSupabaseAuthError(error: SupabaseAuthError): AuthError {
  // Map common Supabase auth errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'email_not_confirmed': 'Please verify your email address',
    'user_not_found': 'No account found with this email',
    'email_exists': 'An account with this email already exists',
    'weak_password': 'Password is too weak. Please use a stronger password.',
    'invalid_email': 'Please enter a valid email address',
    'over_request_rate_limit': 'Too many requests. Please try again later.',
    'signup_disabled': 'Sign up is currently disabled',
    'Database error saving new user': 'Unable to create account. Please contact support.',
  };

  // Check for partial matches (some errors contain additional context)
  let friendlyMessage = errorMap[error.message];
  if (!friendlyMessage) {
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        friendlyMessage = value;
        break;
      }
    }
  }
  
  return new AuthError(friendlyMessage || error.message, error.message);
}

function formatZodErrors(error: { issues: { path: (string | number)[]; message: string }[] }): Record<string, string[]> {
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

// ============================================
// AUTH FUNCTIONS
// ============================================

export const auth = {
  /**
   * Sign up a new user
   */
  async signUp(input: RegisterInput): Promise<AuthResult<{ user: User; session: Session | null }>> {
    // Validate input
    const parsed = RegisterSchema.safeParse(input);
    if (!parsed.success) {
      return { data: null, error: new ValidationError('Invalid registration data', formatZodErrors(parsed.error)) };
    }

    const { name, email, password } = parsed.data;

    // Generate a username from the name (will be finalized by DB trigger)
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 24) || 'user';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username: baseUsername, // Will be finalized/deduped by DB trigger
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase signUp error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user) {
      return { data: null, error: new AuthError('Failed to create account') };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  },

  /**
   * Sign in an existing user
   */
  async signIn(input: LoginInput): Promise<AuthResult<{ user: User; session: Session }>> {
    // Validate input
    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      return { data: null, error: new ValidationError('Invalid login data', formatZodErrors(parsed.error)) };
    }

    const { email, password } = parsed.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user || !data.session) {
      return { data: null, error: new AuthError('Failed to sign in') };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult<void>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    return { data: undefined, error: null };
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<AuthResult<Session | null>> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    return { data: data.session, error: null };
  },

  /**
   * Get the current user
   */
  async getUser(): Promise<AuthResult<User | null>> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // Don't treat "not authenticated" as an error - just return null
      if (error.message.includes('not authenticated') || error.message.includes('invalid claim')) {
        return { data: null, error: null };
      }
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    return { data: data.user, error: null };
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthResult<{ user: User; session: Session }>> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user || !data.session) {
      return { data: null, error: new AuthError('Failed to refresh session') };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  },

  /**
   * Update user password
   */
  async updatePassword(input: Omit<UpdatePasswordInput, 'confirmPassword'> & { confirmPassword?: string }): Promise<AuthResult<User>> {
    // Validate input
    const parsed = UpdatePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { data: null, error: new ValidationError('Invalid password data', formatZodErrors(parsed.error)) };
    }

    // First verify the current password by re-authenticating
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user.email) {
      return { data: null, error: new AuthError('Not authenticated') };
    }

    // Try to sign in with current password to verify it
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: sessionData.session.user.email,
      password: parsed.data.currentPassword,
    });

    if (verifyError) {
      return { data: null, error: new AuthError('Current password is incorrect') };
    }

    // Update to new password
    const { data, error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user) {
      return { data: null, error: new AuthError('Failed to update password') };
    }

    return { data: data.user, error: null };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResult<void>> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    return { data: undefined, error: null };
  },

  /**
   * Set new password after reset
   */
  async setNewPassword(newPassword: string): Promise<AuthResult<User>> {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user) {
      return { data: null, error: new AuthError('Failed to set new password') };
    }

    return { data: data.user, error: null };
  },

  /**
   * Update user email
   */
  async updateEmail(newEmail: string): Promise<AuthResult<User>> {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.user) {
      return { data: null, error: new AuthError('Failed to update email') };
    }

    return { data: data.user, error: null };
  },

  /**
   * Resend confirmation email
   */
  async resendConfirmation(email: string): Promise<AuthResult<void>> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    return { data: undefined, error: null };
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'github'): Promise<AuthResult<{ url: string }>> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    if (!data.url) {
      return { data: null, error: new AuthError('Failed to initiate OAuth flow') };
    }

    return { data: { url: data.url }, error: null };
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<AuthResult<void>> {
    // Note: Account deletion should typically be handled server-side
    // This is a client-side signout - actual deletion should use a server function
    // that verifies the user and calls supabase.auth.admin.deleteUser()

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: handleSupabaseAuthError(error) };
    }

    // In production, you would call a server endpoint that:
    // 1. Verifies the user
    // 2. Deletes all user data
    // 3. Uses admin API to delete the auth user

    return { data: undefined, error: null };
  },
};

// ============================================
// AUTH HOOKS HELPERS
// ============================================

/**
 * Check if a session is expired or about to expire
 */
export function isSessionExpired(session: Session | null, bufferSeconds = 60): boolean {
  if (!session) return true;

  const expiresAt = session.expires_at;
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now <= bufferSeconds;
}

/**
 * Get user metadata
 */
export function getUserMetadata(user: User | null): { name: string | null; avatarUrl: string | null } {
  if (!user) {
    return { name: null, avatarUrl: null };
  }

  return {
    name: user.user_metadata?.name || user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
}
