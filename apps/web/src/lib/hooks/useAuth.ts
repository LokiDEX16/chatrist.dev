'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { auth, isSessionExpired, getUserMetadata, AuthError } from '@/lib/supabase/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: AuthError }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  userName: string | null;
  userAvatar: string | null;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: session } = await auth.getSession();
        const { data: user } = await auth.getUser();

        if (mounted) {
          setState({
            user,
            session,
            isLoading: false,
            isAuthenticated: !!user && !!session,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof AuthError ? err : new AuthError('Failed to initialize auth'),
          }));
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setState((prev) => ({
          ...prev,
          user: session?.user || null,
          session,
          isAuthenticated: !!session,
          error: null,
        }));
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-refresh session when about to expire
  useEffect(() => {
    if (!state.session || state.isLoading) return;

    const checkAndRefresh = async () => {
      if (isSessionExpired(state.session, 300)) { // 5 minutes before expiry
        await auth.refreshSession();
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60000);

    return () => clearInterval(interval);
  }, [state.session, state.isLoading]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await auth.signIn({ email, password });

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }

    setState({
      user: data.user,
      session: data.session,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    });

    return { success: true };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, confirmPassword: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await auth.signUp({ name, email, password, confirmPassword });

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }

    // If email confirmation is required, user won't have a session yet
    if (data.session) {
      setState({
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }

    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await auth.signOut();

    setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });

    router.push('/login');
  }, [router]);

  const refreshSession = useCallback(async () => {
    const { data, error } = await auth.refreshSession();

    if (!error && data) {
      setState((prev) => ({
        ...prev,
        user: data.user,
        session: data.session,
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const metadata = getUserMetadata(state.user);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession,
    clearError,
    userName: metadata.name,
    userAvatar: metadata.avatarUrl,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}

/**
 * Hook to redirect authenticated users away from auth pages
 * If redirectTo is '/dashboard' (default), it will resolve to /${username}/dashboard
 */
export function useRedirectAuthenticated(redirectTo = '/dashboard') {
  const authState = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated && authState.user) {
      // Resolve dynamic redirect for dashboard
      let destination = redirectTo;
      if (redirectTo === '/dashboard' || redirectTo.startsWith('/dashboard/')) {
        const username = authState.user.user_metadata?.username ||
          authState.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30) ||
          authState.user.id?.slice(0, 8) ||
          'user';
        destination = redirectTo.replace('/dashboard', `/${username}/dashboard`);
      }
      router.push(destination);
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.user, router, redirectTo]);

  return authState;
}
