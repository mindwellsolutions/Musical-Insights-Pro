/**
 * Middleware for Supabase SSR Authentication
 * Handles session refresh and route protection
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components.
  // Wrapped in try/catch to gracefully handle network failures (e.g. TLS errors in
  // environments with proxy-based certificate interception). A failed fetch is treated
  // as unauthenticated rather than crashing the middleware.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Network/TLS error — fall through as unauthenticated
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/']; // Main app route
  const authPaths = ['/login', '/reset-password', '/auth/callback'];
  const adminPaths = ['/admin/dashboard', '/admin']; // Admin routes

  // Routes that require active subscription (excluding subscription management pages)
  const subscriptionRequiredPaths = [
    '/chord-progression-builder',
    '/note-detector',
    // Add other premium features here
  ];

  // Public subscription-related routes (don't require active subscription)
  const subscriptionPublicPaths = [
    '/pricing',
    '/subscription/manage',
    '/subscription/required',
    '/subscription/success',
    '/subscription/canceled',
  ];

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );
  const isAdminPath = adminPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );
  const isSubscriptionRequiredPath = subscriptionRequiredPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );
  const isSubscriptionPublicPath = subscriptionPublicPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // Check admin access for admin routes
  if (isAdminPath && user) {
    // Create admin client to check user_type
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // No-op for service role client
          },
          remove(name: string, options: CookieOptions) {
            // No-op for service role client
          },
        },
      }
    );

    const { data: userSettings } = await adminSupabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    // Redirect to home if not admin
    if (!userSettings || (userSettings.user_type !== 'admin' && userSettings.user_type !== 'moderator')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to login if accessing admin route without authentication
  if (isAdminPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if accessing auth pages while authenticated
  if (isAuthPath && user && request.nextUrl.pathname !== '/auth/callback') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Check subscription for subscription-required paths
  if (isSubscriptionRequiredPath && user && !isSubscriptionPublicPath) {
    // Create admin client to check subscription and bypass flag
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // No-op for service role client
          },
          remove(name: string, options: CookieOptions) {
            // No-op for service role client
          },
        },
      }
    );

    // Check if user has subscription bypass enabled
    const { data: userSettings } = await adminSupabase
      .from('user_settings')
      .select('subscription_bypass')
      .eq('user_id', user.id)
      .single();

    // If bypass is enabled, skip subscription check
    if (userSettings?.subscription_bypass === true) {
      return response;
    }

    const { data: subscription } = await adminSupabase
      .from('user_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .single();

    // Check if subscription is active
    const hasActiveSubscription = subscription &&
      ['active', 'trialing'].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

    // Redirect to subscription required page if no active subscription
    if (!hasActiveSubscription) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/subscription/required';
      redirectUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

