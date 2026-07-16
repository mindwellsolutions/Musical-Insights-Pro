/**
 * React Query Client Configuration
 * Optimized for fast user settings loading with aggressive caching
 */

import { QueryClient } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache user settings for 5 minutes (they rarely change)
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Keep cached data for 10 minutes even if unused
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus to keep settings in sync
        refetchOnWindowFocus: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Refetch on reconnect to sync after offline
        refetchOnReconnect: true,

        // Network mode - always try to fetch, even if offline (will use cache)
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Network mode for mutations
        networkMode: 'online',
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Legacy export for backward compatibility
export const queryClient = getQueryClient();

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  userSettings: (userId: string) => ['user-settings', userId] as const,
  userMidiConfig: (userId: string) => ['user-midi-config', userId] as const,
  userManualSelections: (userId: string) => ['user-manual-selections', userId] as const,
} as const;

