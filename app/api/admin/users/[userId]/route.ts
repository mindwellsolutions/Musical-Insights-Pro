/**
 * Admin User Detail API Route
 * Handles getting, updating, and deleting individual users
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-check';
import { createAdminClient } from '@/lib/supabase/server';
import type { UpdateUserData } from '@/types/admin';

/**
 * GET /api/admin/users/[userId]
 * Get detailed user information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const supabase = await createAdminClient();

    // Get auth user
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
      throw authError;
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    return NextResponse.json({
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at,
      updated_at: authData.user.updated_at,
      last_sign_in_at: authData.user.last_sign_in_at,
      email_confirmed_at: authData.user.email_confirmed_at,
      user_type: settings?.user_type || null,
      settings: settings || {},
      metadata: authData.user.user_metadata || {},
      app_metadata: authData.user.app_metadata || {},
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/users/[userId]:', error);
    
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
 * PATCH /api/admin/users/[userId]
 * Update user information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const body: UpdateUserData = await request.json();

    const supabase = await createAdminClient();

    // Update auth user if email or metadata changed
    if (body.email || body.metadata) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        email: body.email,
        user_metadata: body.metadata,
      });

      if (authError) {
        throw authError;
      }
    }

    // Update user settings if user_type or settings changed
    if (body.user_type !== undefined || body.settings) {
      const updateData: any = {};
      
      if (body.user_type !== undefined) {
        updateData.user_type = body.user_type;
      }
      
      if (body.settings) {
        Object.assign(updateData, body.settings);
      }

      const { error: settingsError } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId);

      if (settingsError) {
        throw settingsError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/users/[userId]:', error);
    
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
 * DELETE /api/admin/users/[userId]
 * Delete a user account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminUserId } = await requireAdmin();
    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (adminUserId === userId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Cannot delete your own account' } },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Delete auth user (cascades to user_settings via FK)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users/[userId]:', error);
    
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

