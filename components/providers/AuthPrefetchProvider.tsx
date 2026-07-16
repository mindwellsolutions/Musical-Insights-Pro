'use client';

/**
 * Auth Prefetch Provider
 * Sets up automatic prefetching of user settings on authentication
 */

import { useEffect } from 'react';
import { setupAuthPrefetching } from '@/lib/react-query/prefetch-user-settings';

export function AuthPrefetchProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up auth state listener for prefetching
    setupAuthPrefetching();
  }, []);

  return <>{children}</>;
}

