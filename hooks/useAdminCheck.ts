'use client';

/**
 * Admin Check Hook
 * Client-side hook to check admin status
 */

import { useAdminContext } from '@/contexts/AdminContext';

export function useAdminCheck() {
  return useAdminContext();
}

