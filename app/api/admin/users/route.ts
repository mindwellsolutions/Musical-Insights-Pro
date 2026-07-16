/**
 * Admin Users API Route
 * Handles listing and creating users
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import { createAdminClient } from '@/lib/supabase/server';
import type { UserListResponse, CreateUserData } from '@/types/admin';

/**
 * GET /api/admin/users
 * List all users with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    const supabase = await createAdminClient();

    // Build query for users
    let query = supabase
      .from('user_settings')
      .select('user_id, user_type, created_at', { count: 'exact' });

    // Apply role filter
    if (role !== 'all') {
      if (role === 'user') {
        query = query.is('user_type', null);
      } else {
        query = query.eq('user_type', role);
      }
    }

    // Get total count and user settings
    const { data: userSettings, error: settingsError, count } = await query;

    if (settingsError) {
      throw settingsError;
    }

    // Get auth users data
    const userIds = userSettings?.map(s => s.user_id) || [];
    
    if (userIds.length === 0) {
      return NextResponse.json({
        users: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    // Fetch auth users using admin client
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (authError) {
      throw authError;
    }

    // Combine auth data with settings
    const users = authData.users
      .map(user => {
        const settings = userSettings?.find(s => s.user_id === user.id);
        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || null,
          email_confirmed_at: user.email_confirmed_at || null,
          user_type: settings?.user_type || null,
          settings: settings || null,
        };
      })
      .filter(user => {
        // Apply search filter
        if (search) {
          return user.email.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      });

    const response: UserListResponse = {
      users,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    
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

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const body: CreateUserData = await request.json();
    const { email, password, user_type, metadata } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {},
    });

    if (authError) {
      throw authError;
    }

    // Create user settings with role
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: authData.user.id,
        user_type: user_type || null,
      });

    if (settingsError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw settingsError;
    }

    return NextResponse.json({
      id: authData.user.id,
      email: authData.user.email,
      user_type,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error);
    
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

