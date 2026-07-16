/**
 * Optimized User Settings Query Hook
 * Uses React Query with localStorage fallback for instant page loads
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/react-query/query-client';
import { useEffect, useState } from 'react';

interface UserSettings {
  [key: string]: any;
}

/**
 * Fetches user settings from Supabase
 */
async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

/**
 * Updates user settings in Supabase
 */
async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

/**
 * Hook for accessing user settings with instant loads via localStorage cache
 */
export function useUserSettingsQuery() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Query for user settings
  const query = useQuery({
    queryKey: queryKeys.userSettings(userId || 'anonymous'),
    queryFn: () => fetchUserSettings(userId!),
    enabled: !!userId,
    // Use initialData from localStorage for instant render
    initialData: () => {
      if (typeof window === 'undefined' || !userId) return null;
      
      const cached = localStorage.getItem(`user-settings-cache-${userId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
      return null;
    },
  });

  // Update localStorage cache when data changes
  useEffect(() => {
    if (query.data && userId) {
      localStorage.setItem(`user-settings-cache-${userId}`, JSON.stringify(query.data));
    }
  }, [query.data, userId]);

  // Mutation for updating settings
  const mutation = useMutation({
    mutationFn: (settings: Partial<UserSettings>) => updateUserSettings(userId!, settings),
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userSettings(userId || 'anonymous') });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData(queryKeys.userSettings(userId || 'anonymous'));

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.userSettings(userId || 'anonymous'), (old: any) => ({
        ...old,
        ...newSettings,
      }));

      return { previousSettings };
    },
    onError: (_err, _newSettings, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(
          queryKeys.userSettings(userId || 'anonymous'),
          context.previousSettings
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.userSettings(userId || 'anonymous') });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

