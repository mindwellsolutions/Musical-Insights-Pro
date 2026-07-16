/**
 * Review Submission API Route
 * Handles customer review submissions with photo uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewSubmissionSchema } from '@/lib/validations/review-schema';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const customer_name = formData.get('customer_name') as string;
    const customer_email = formData.get('customer_email') as string;
    const service_type = formData.get('service_type') as string;
    const rating = parseInt(formData.get('rating') as string);
    const review_text = formData.get('review_text') as string;
    const event_date = formData.get('event_date') as string | null;
    const event_location = formData.get('event_location') as string | null;

    // Validate data
    const validationResult = reviewSubmissionSchema.safeParse({
      customer_name,
      customer_email,
      service_type,
      rating,
      review_text,
      event_date,
      event_location
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid form data', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert review into database
    const { data: review, error: reviewError } = await supabase
      .from('customer_reviews')
      .insert({
        customer_name,
        customer_email,
        service_type,
        rating,
        review_text,
        event_date: event_date || null,
        event_location: event_location || null,
        is_approved: false
      })
      .select()
      .single();

    if (reviewError || !review) {
      console.error('Error inserting review:', reviewError);
      return NextResponse.json(
        { message: 'Failed to submit review' },
        { status: 500 }
      );
    }

    // Handle photo uploads
    const photoKeys = Array.from(formData.keys()).filter(key => key.startsWith('photo_'));
    
    if (photoKeys.length > 0) {
      const uploadPromises = photoKeys.map(async (key, index) => {
        const file = formData.get(key) as File;
        if (!file) return null;

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${review.id}_${index}_${Date.now()}.${fileExt}`;
        const filePath = `reviews/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(filePath);

        // Insert image record
        const { error: imageError } = await supabase
          .from('review_images')
          .insert({
            review_id: review.id,
            image_url: publicUrl,
            image_path: filePath,
            display_order: index
          });

        if (imageError) {
          console.error('Error inserting image record:', imageError);
          return null;
        }

        return publicUrl;
      });

      await Promise.all(uploadPromises);
    }

    return NextResponse.json(
      { 
        message: 'Review submitted successfully',
        reviewId: review.id
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error in review submission:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

