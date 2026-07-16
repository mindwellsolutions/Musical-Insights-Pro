/**
 * Admin User Invite API Route
 * POST /api/admin/users/invite
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin-check';

interface InviteUserData {
  email: string;
  user_type?: 'admin' | 'moderator' | null;
  metadata?: Record<string, any>;
}

/**
 * POST /api/admin/users/invite
 * Send invitation email to a new user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const body: InviteUserData = await request.json();
    const { email, user_type, metadata } = body;

    if (!email) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email is required' } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Invite user via Supabase Auth
    // This sends an email with a magic link to set up their password
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: metadata || {},
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    });

    if (authError) {
      throw authError;
    }

    // Create user settings with role if user was successfully invited
    if (authData.user) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: authData.user.id,
          user_type: user_type || null,
        });

      if (settingsError) {
        // Log error but don't fail the request since the invite was sent
        console.error('Error creating user settings:', settingsError);
      }
    }

    return NextResponse.json({
      id: authData.user.id,
      email: authData.user.email,
      user_type,
      message: 'Invitation sent successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users/invite:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to invite user' } },
      { status: 500 }
    );
  }
}

