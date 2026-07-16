'use client';

/**
 * Admin Dashboard Page
 * Main admin dashboard with user management
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, UserPlus, LogOut, Mail, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client-ssr';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAdminUserList, useAdminStats, useDeleteUser } from '@/hooks/admin/useAdminUsers';
import { StatisticsCards } from '@/components/admin/StatisticsCards';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserSearchBar } from '@/components/admin/UserSearchBar';
import { UserFilters } from '@/components/admin/UserFilters';
import { AddUserDialog } from '@/components/admin/AddUserDialog';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { DeleteUserConfirmation } from '@/components/admin/DeleteUserConfirmation';
import { SubscriptionSystemToggle } from '@/components/admin/SubscriptionSystemToggle';
import type { UserFilters as UserFiltersType } from '@/types/admin';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();

  const [filters, setFilters] = useState<UserFiltersType>({
    role: 'all',
    status: 'all',
    dateRange: 'all',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<{ id: string; email: string } | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading, refetch } = useAdminUserList(filters, page, limit);
  const deleteUserMutation = useDeleteUser();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isAdminLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;

    try {
      await deleteUserMutation.mutateAsync(deleteUser.id);
      setDeleteUser(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (isAdminLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--mi-text-secondary)', fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Admin Header Bar */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'var(--mi-border-medium)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: 'var(--mi-accent-amber)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-accent-amber)' }}>Admin Dashboard</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
            <ChevronLeft size={14} /> Back to App
          </Link>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-accent-red)', cursor: 'pointer' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {/* Subscription System Toggle */}
        <SubscriptionSystemToggle />

        {/* Statistics Cards */}
        <StatisticsCards stats={stats} isLoading={statsLoading} />

        {/* User Management Section */}
        <div
          style={{
            background: 'var(--mi-bg-surface)',
            border: '1px solid var(--mi-border-medium)',
            borderRadius: 'var(--mi-radius-lg)',
            padding: 24,
            marginTop: 24,
          }}
        >
          {/* Header with Search and Add Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--mi-text-primary)', margin: 0 }}>
              User Management
            </h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowInviteDialog(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--mi-accent-violet-dim)', border: '1px solid var(--mi-accent-violet)', borderRadius: 'var(--mi-radius-md)', color: 'var(--mi-accent-violet)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <Mail size={14} /> Invite User
              </button>
              <button
                onClick={() => setShowAddDialog(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)', border: 'none', borderRadius: 'var(--mi-radius-md)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <UserPlus size={14} /> Add User
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <UserSearchBar
              value={filters.search || ''}
              onChange={(search) => setFilters({ ...filters, search })}
            />
            <UserFilters
              filters={filters}
              onChange={setFilters}
              onClear={() =>
                setFilters({
                  role: 'all',
                  status: 'all',
                  dateRange: 'all',
                  search: '',
                })
              }
            />
          </div>

          {/* User Table */}
          <UserManagementTable
            users={usersData?.users || []}
            total={usersData?.total || 0}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onEdit={setEditUserId}
            onDelete={(userId) => {
              const user = usersData?.users.find((u) => u.id === userId);
              if (user) {
                setDeleteUser({ id: user.id, email: user.email });
              }
            }}
            isLoading={usersLoading}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddUserDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => refetch()}
      />
      <InviteUserDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onSuccess={() => refetch()}
      />
      <EditUserDialog
        isOpen={!!editUserId}
        onClose={() => setEditUserId(null)}
        userId={editUserId || ''}
        onSuccess={() => refetch()}
      />
      <DeleteUserConfirmation
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        user={deleteUser}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteUserMutation.isPending}
      />
    </div>
  );
}

