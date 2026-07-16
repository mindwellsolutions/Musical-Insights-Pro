/**
 * Auth Callback Route Handler
 * Handles the OAuth callback and email confirmation flows
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the next URL or home
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
}

