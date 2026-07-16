'use client';

/**
 * User Filters Component
 * Filter users by role, status, and date range
 */

import React from 'react';
import { Filter, X } from 'lucide-react';
import type { UserFilters } from '@/types/admin';

interface UserFiltersProps {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
  onClear: () => void;
}

export function UserFilters({ filters, onChange, onClear }: UserFiltersProps) {
  const hasActiveFilters =
    filters.role !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={20} style={{ color: '#a0a0a0' }} />
        <span style={{ fontSize: '14px', color: '#a0a0a0', fontWeight: 500 }}>Filters:</span>
      </div>

      {/* Role Filter */}
      <select
        value={filters.role}
        onChange={(e) =>
          onChange({ ...filters, role: e.target.value as UserFilters['role'] })
        }
        style={{
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '14px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as UserFilters['status'] })
        }
        style={{
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '14px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Date Range Filter */}
      <select
        value={filters.dateRange}
        onChange={(e) =>
          onChange({ ...filters, dateRange: e.target.value as UserFilters['dateRange'] })
        }
        style={{
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '14px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="all">All Time</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
      </select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          style={{
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 200ms ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <X size={16} />
          Clear Filters
        </button>
      )}
    </div>
  );
}

