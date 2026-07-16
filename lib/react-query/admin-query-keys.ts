/**
 * Admin React Query Keys
 * Centralized query key management for admin features
 */

import type { UserFilters } from '@/types/admin';

export const adminQueryKeys = {
  all: ['admin'] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  userList: (filters: UserFilters) => [...adminQueryKeys.users(), 'list', filters] as const,
  userDetail: (userId: string) => [...adminQueryKeys.users(), 'detail', userId] as const,
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  activityLog: (userId: string) => [...adminQueryKeys.all, 'activity', userId] as const,
};

