/**
 * Admin API Client
 * Client-side functions for admin API calls
 */

import type {
  UserListResponse,
  UserDetailResponse,
  AdminStatsResponse,
  CreateUserData,
  UpdateUserData,
  InviteUserData,
  UserFilters,
} from '@/types/admin';

export async function fetchAdminUsers(filters: UserFilters, page: number = 1, limit: number = 50): Promise<UserListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    role: filters.role,
    status: filters.status,
  });

  if (filters.search) {
    params.append('search', filters.search);
  }

  const response = await fetch(`/api/admin/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch users');
  }

  return response.json();
}

export async function fetchAdminUserDetail(userId: string): Promise<UserDetailResponse> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch user details');
  }

  return response.json();
}

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  const response = await fetch('/api/admin/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch stats');
  }

  return response.json();
}

export async function createUser(data: CreateUserData): Promise<any> {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create user');
  }

  return response.json();
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<any> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete user');
  }
}

export async function inviteUser(data: InviteUserData): Promise<any> {
  const response = await fetch('/api/admin/users/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to invite user');
  }

  return response.json();
}

