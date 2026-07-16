/**
 * Admin API - Get Pending Reviews
 * Fetch all pending reviews (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPendingReviews } from '@/lib/supabase/reviews-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch pending reviews
    const reviews = await getPendingReviews();

    return NextResponse.json(
      { reviews },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

