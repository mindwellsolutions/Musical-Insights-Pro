/**
 * Admin Statistics API Route
 * Returns dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import { createAdminClient } from '@/lib/supabase/server';
import type { AdminStatsResponse } from '@/types/admin';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = await createAdminClient();

    // Get total users count
    const { count: totalUsers, error: totalError } = await supabase
      .from('user_settings')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw totalError;
    }

    // Get active users (last 30 days) - users who signed in recently
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    const activeUsers = authUsers.users.filter(user => {
      if (!user.last_sign_in_at) return false;
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn >= thirtyDaysAgo;
    }).length;

    // Get new users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = authUsers.users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= sevenDaysAgo;
    }).length;

    // Get admin and moderator counts
    const { data: roleData, error: roleError } = await supabase
      .from('user_settings')
      .select('user_type');

    if (roleError) {
      throw roleError;
    }

    const adminCount = roleData?.filter(r => r.user_type === 'admin').length || 0;
    const moderatorCount = roleData?.filter(r => r.user_type === 'moderator').length || 0;

    // Calculate trends (simplified - comparing to previous period)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriodActive = authUsers.users.filter(user => {
      if (!user.last_sign_in_at) return false;
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn >= sixtyDaysAgo && lastSignIn < thirtyDaysAgo;
    }).length;

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const previousPeriodNew = authUsers.users.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo;
    }).length;

    const usersGrowth = previousPeriodNew > 0 
      ? ((newUsers - previousPeriodNew) / previousPeriodNew) * 100 
      : newUsers > 0 ? 100 : 0;

    const activeGrowth = previousPeriodActive > 0 
      ? ((activeUsers - previousPeriodActive) / previousPeriodActive) * 100 
      : activeUsers > 0 ? 100 : 0;

    const response: AdminStatsResponse = {
      totalUsers: totalUsers || 0,
      activeUsers,
      newUsers,
      adminCount,
      moderatorCount,
      trends: {
        usersGrowth: Math.round(usersGrowth * 10) / 10,
        activeGrowth: Math.round(activeGrowth * 10) / 10,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/admin/stats:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

