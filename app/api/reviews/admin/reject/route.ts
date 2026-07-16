/**
 * Admin API - Reject/Delete Review
 * Delete a review and its images (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteReview } from '@/lib/supabase/reviews-service';

export async function DELETE(request: NextRequest) {
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

    // Delete the review
    await deleteReview(reviewId);

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

