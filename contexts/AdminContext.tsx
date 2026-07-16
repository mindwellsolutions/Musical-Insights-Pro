'use client';

/**
 * Admin Context Provider
 * Provides admin state management for client components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';
import { useQuery } from '@tanstack/react-query';
import type { UserRole } from '@/types/admin';

interface AdminContextValue {
  isAdmin: boolean;
  userRole: UserRole;
  isLoading: boolean;
  refetch: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

async function fetchAdminStatus(): Promise<{ isAdmin: boolean; userRole: UserRole }> {
  try {
    const response = await fetch('/api/admin/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { isAdmin: false, userRole: null };
    }

    const data = await response.json();
    return {
      isAdmin: data.isAdmin || false,
      userRole: data.userRole || null,
    };
  } catch (error) {
    console.error('Error fetching admin status:', error);
    return { isAdmin: false, userRole: null };
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Fetch admin status using React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-status', userId],
    queryFn: fetchAdminStatus,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });

  const value: AdminContextValue = {
    isAdmin: data?.isAdmin || false,
    userRole: data?.userRole || null,
    isLoading: isLoading && !!userId,
    refetch,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
}

