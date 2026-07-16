'use client';

/**
 * Admin Users Hooks
 * React Query hooks for admin user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminQueryKeys } from '@/lib/react-query/admin-query-keys';
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  fetchAdminStats,
  createUser,
  updateUser,
  deleteUser,
  inviteUser,
} from '@/lib/api/admin-client';
import type { UserFilters, CreateUserData, UpdateUserData, InviteUserData } from '@/types/admin';

export function useAdminUserList(filters: UserFilters, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: adminQueryKeys.userList(filters),
    queryFn: () => fetchAdminUsers(filters, page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: adminQueryKeys.userDetail(userId),
    queryFn: () => fetchAdminUserDetail(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminQueryKeys.stats(),
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => createUser(data),
    onSuccess: () => {
      // Invalidate user list and stats
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      updateUser(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific user and user list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      // Invalidate user list and stats
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserData) => inviteUser(data),
    onSuccess: () => {
      // Invalidate user list and stats
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
    },
  });
}

