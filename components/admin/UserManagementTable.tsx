'use client';

/**
 * User Management Table Component
 * Displays and manages users in a table format
 */

import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import type { AdminUser } from '@/types/admin';

interface UserManagementTableProps {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

function RoleBadge({ role }: { role: 'admin' | 'moderator' | null }) {
  const colors = {
    admin: { bg: '#8b5cf6', text: '#ffffff' },
    moderator: { bg: '#3b82f6', text: '#ffffff' },
    user: { bg: '#6b7280', text: '#ffffff' },
  };

  const displayRole = role || 'user';
  const color = colors[displayRole];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: color.bg,
        color: color.text,
      }}
    >
      {displayRole}
    </span>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

export function UserManagementTable({
  users,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  isLoading,
}: UserManagementTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      style={{
        background: 'rgba(30, 30, 46, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Email
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Role
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Created
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Last Login
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Status
              </th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#a0a0a0' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td colSpan={6} style={{ padding: '16px' }}>
                    <div
                      style={{
                        height: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#a0a0a0' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: hoveredRow === user.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    transition: 'background 200ms ease-in-out',
                  }}
                  onMouseEnter={() => setHoveredRow(user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '16px', color: '#ffffff', fontSize: '14px' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <RoleBadge role={user.user_type} />
                  </td>
                  <td style={{ padding: '16px', color: '#a0a0a0', fontSize: '14px' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '16px', color: '#a0a0a0', fontSize: '14px' }}>
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: user.email_confirmed_at ? '#10b981' : '#6b7280',
                        marginRight: '8px',
                      }}
                    />
                    <span style={{ color: '#a0a0a0', fontSize: '14px' }}>
                      {user.email_confirmed_at ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onEdit(user.id)}
                      style={{
                        padding: '8px 16px',
                        marginRight: '8px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 200ms ease-in-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                      }}
                    >
                      <Edit size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 200ms ease-in-out',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      }}
                    >
                      <Trash2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#a0a0a0' }}>
            Page {page} of {totalPages || 1}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                background: page === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: page === 1 ? '#6b7280' : '#3b82f6',
                fontSize: '14px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '8px 16px',
                background: page >= totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: page >= totalPages ? '#6b7280' : '#3b82f6',
                fontSize: '14px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

