/**
 * Admin Dashboard Type Definitions
 */

export type UserRole = 'admin' | 'moderator' | 'user' | null;

export interface UserSettings {
  user_id: string;
  theme?: string;
  root_note?: string;
  scale_name?: string;
  user_type?: 'admin' | 'moderator' | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_type: 'admin' | 'moderator' | null;
  settings: UserSettings | null;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserDetailResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_type: 'admin' | 'moderator' | null;
  settings: UserSettings;
  metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}

export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number; // Last 30 days
  newUsers: number; // Last 7 days
  adminCount: number;
  moderatorCount: number;
  trends: {
    usersGrowth: number; // Percentage
    activeGrowth: number; // Percentage
  };
}

export interface UserFilters {
  role: 'all' | 'admin' | 'moderator' | 'user';
  status: 'all' | 'active' | 'inactive';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  search?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  user_type?: 'admin' | 'moderator' | null;
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  email?: string;
  user_type?: 'admin' | 'moderator' | null;
  metadata?: Record<string, any>;
  settings?: Partial<UserSettings>;
}

export interface InviteUserData {
  email: string;
  user_type?: 'admin' | 'moderator' | null;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

