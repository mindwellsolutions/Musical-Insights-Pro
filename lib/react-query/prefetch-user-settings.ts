/**
 * Prefetch User Settings
 * Prefetches user settings immediately after authentication for zero-delay page loads
 */

import { queryClient, queryKeys } from './query-client';
import { createClient } from '@/lib/supabase/client-ssr';

/**
 * Fetches user settings from Supabase
 */
async function fetchUserSettings(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error prefetching user settings:', error);
    return null;
  }

  return data;
}

/**
 * Prefetches user settings and stores in React Query cache
 * This ensures instant page loads when navigating
 */
export async function prefetchUserSettings(userId: string) {
  try {
    // Prefetch user settings
    await queryClient.prefetchQuery({
      queryKey: queryKeys.userSettings(userId),
      queryFn: () => fetchUserSettings(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Also cache in localStorage for instant initial render on next page load
    const settings = queryClient.getQueryData(queryKeys.userSettings(userId));
    if (settings && typeof window !== 'undefined') {
      localStorage.setItem(`user-settings-cache-${userId}`, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error prefetching user settings:', error);
  }
}

/**
 * Sets up auth state listener to prefetch settings on login
 * Call this once in your app initialization
 */
export function setupAuthPrefetching() {
  const supabase = createClient();

  // Prefetch on initial load if user is already logged in
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      prefetchUserSettings(user.id);
    }
  });

  // Prefetch whenever auth state changes (login, signup, etc.)
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      prefetchUserSettings(session.user.id);
    }
  });
}

