'use client';

/**
 * Admin Statistics Cards Component
 * Displays key metrics in card format
 */

import React from 'react';
import { Users, UserCheck, UserPlus, Shield } from 'lucide-react';
import type { AdminStatsResponse } from '@/types/admin';

interface StatisticsCardsProps {
  stats: AdminStatsResponse | undefined;
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  isLoading?: boolean;
}

function StatCard({ icon, label, value, trend, isLoading }: StatCardProps) {
  const trendColor = trend && trend > 0 ? '#10b981' : trend && trend < 0 ? '#ef4444' : '#6b7280';
  const trendSymbol = trend && trend > 0 ? '↑' : trend && trend < 0 ? '↓' : '';

  return (
    <div
      style={{
        background: 'rgba(30, 30, 46, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 200ms ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 48px rgba(59, 130, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#a0a0a0' }}>{label}</span>
      </div>

      {isLoading ? (
        <div
          style={{
            height: '40px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      ) : (
        <>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            {value.toLocaleString()}
          </div>
          {trend !== undefined && (
            <div style={{ fontSize: '14px', color: trendColor, fontWeight: 500 }}>
              {trendSymbol} {Math.abs(trend).toFixed(1)}% this period
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}
    >
      <StatCard
        icon={<Users size={24} />}
        label="Total Users"
        value={stats?.totalUsers || 0}
        trend={stats?.trends.usersGrowth}
        isLoading={isLoading}
      />
      <StatCard
        icon={<UserCheck size={24} />}
        label="Active Users"
        value={stats?.activeUsers || 0}
        trend={stats?.trends.activeGrowth}
        isLoading={isLoading}
      />
      <StatCard
        icon={<UserPlus size={24} />}
        label="New Users (7d)"
        value={stats?.newUsers || 0}
        isLoading={isLoading}
      />
      <StatCard
        icon={<Shield size={24} />}
        label="Admin Count"
        value={stats?.adminCount || 0}
        isLoading={isLoading}
      />
    </div>
  );
}

