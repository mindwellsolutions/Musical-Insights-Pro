/**
 * Admin API - Approve Review
 * Approve a pending review (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { approveReview } from '@/lib/supabase/reviews-service';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { message: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Approve the review
    await approveReview(reviewId, user.id);

    return NextResponse.json(
      { message: 'Review approved successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

