/**
 * Admin Authentication & Authorization Utilities
 * Server-side utilities for verifying admin status
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'moderator' | 'user' | null;

/**
 * Check if a specific user ID is an admin
 * Uses service role key to bypass RLS
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.user_type === 'admin';
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
}

/**
 * Get the role of a specific user
 * Returns 'admin', 'moderator', 'user', or null
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }

    return data?.user_type || 'user';
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return 'user';
  }
}

/**
 * Get the current authenticated user's role
 * Uses the session from cookies
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    return getUserRole(user.id);
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error);
    return null;
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in API routes and server actions
 */
export async function requireAdmin(): Promise<{ userId: string; isAdmin: true }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const isAdmin = await isUserAdmin(user.id);

  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return { userId: user.id, isAdmin: true };
}

/**
 * Check if current user is admin (non-throwing version)
 * Returns false if not authenticated or not admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    return isUserAdmin(user.id);
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}

