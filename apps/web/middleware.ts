import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Reserved paths that cannot be usernames
const RESERVED_PATHS = new Set([
  'api', 'auth', 'login', 'register', 'profile', 'dashboard',
  'admin', 'app', 'blog', 'help', 'logout', 'settings', 'support',
  'www', 'chatrist', 'about', 'contact', 'terms', 'privacy',
  'pricing', 'features', 'docs', 'status', '_next', 'favicon.ico'
]);

// User-scoped route sections
const USER_ROUTE_SECTIONS = new Set([
  'dashboard', 'campaigns', 'flows', 'leads', 'instagram',
  'later', 'public-profile', 'instant-open', 'plan',
  'affiliate', 'tutorials', 'settings', 'analytics'
]);

// Valid username regex: alphanumeric + underscore, 3-30 chars
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Handle /@username routes — rewrite to /profile/username
  if (pathname.startsWith('/@')) {
    const username = pathname.slice(2).split('/')[0]; // Get username part after /@
    if (USERNAME_REGEX.test(username)) {
      const url = request.nextUrl.clone();
      url.pathname = `/profile/${username}`;
      return NextResponse.rewrite(url);
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  // Helper: Get username from user metadata or generate fallback
  const getUsername = (): string => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    // Fallback: use first part of email or user ID
    if (user?.email) {
      const emailUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);
      return emailUsername || user.id.slice(0, 8);
    }
    return user?.id?.slice(0, 8) || 'user';
  };

  // 2. Handle /dashboard* routes - redirect to /${username}/dashboard* (backward compatibility)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      // Not logged in, redirect to login with redirect param
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Logged in, redirect to user-scoped route
    const username = getUsername();
    const newPath = pathname.replace('/dashboard', `/${username}/dashboard`);
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // 3. Handle /login, /register when authenticated - redirect to /${username}/dashboard
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  if (isAuthRoute && session) {
    const username = getUsername();
    return NextResponse.redirect(new URL(`/${username}/dashboard`, request.url));
  }

  // 4. Handle user-scoped routes (/${username}/*) - verify session and username match
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length >= 1) {
    const potentialUsername = pathParts[0];

    // Skip if it's a reserved path or doesn't look like a username
    if (!RESERVED_PATHS.has(potentialUsername) && USERNAME_REGEX.test(potentialUsername)) {
      // Check if this is a user-scoped route
      const routeSection = pathParts[1];
      const isUserRoute = pathParts.length >= 2 && USER_ROUTE_SECTIONS.has(routeSection);

      // Also handle /${username} alone - redirect to /${username}/dashboard
      if (pathParts.length === 1) {
        if (!session) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        }
        const actualUsername = getUsername();
        // Redirect to the correct user's dashboard
        return NextResponse.redirect(new URL(`/${actualUsername}/dashboard`, request.url));
      }

      if (isUserRoute) {
        // Protected route - require authentication
        if (!session) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // Verify the URL username matches the logged-in user's username
        const actualUsername = getUsername();
        if (potentialUsername !== actualUsername) {
          // Redirect to the correct username URL
          const correctedPath = pathname.replace(`/${potentialUsername}/`, `/${actualUsername}/`);
          return NextResponse.redirect(new URL(correctedPath, request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next (Next.js internals)
     * - Static files (images, etc.)
     */
    '/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
