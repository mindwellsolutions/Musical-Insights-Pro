/**
 * Public API - Get Approved Reviews
 * Fetch all approved reviews (public access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApprovedReviews } from '@/lib/supabase/reviews-service';

export async function GET(request: NextRequest) {
  try {
    // Fetch approved reviews
    const reviews = await getApprovedReviews();

    return NextResponse.json(
      { reviews },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching approved reviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

