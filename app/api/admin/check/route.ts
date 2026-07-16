/**
 * Admin Check API Route
 * Returns the current user's admin status and role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserRole } from '@/lib/auth/admin-check';

export async function GET(request: NextRequest) {
  try {
    const userRole = await getCurrentUserRole();
    const isAdmin = userRole === 'admin';

    return NextResponse.json({
      isAdmin,
      userRole,
    });
  } catch (error: any) {
    console.error('Error in admin check:', error);
    return NextResponse.json(
      { isAdmin: false, userRole: null },
      { status: 200 } // Return 200 even on error to avoid breaking the UI
    );
  }
}

