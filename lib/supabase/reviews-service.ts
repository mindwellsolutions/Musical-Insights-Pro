/**
 * Reviews Service
 * Database operations for customer reviews system
 */

import { createClient as createAdminClient } from '@/lib/supabase/server';
import { CustomerReview, ReviewImage, ReviewWithImages } from '@/lib/validations/review-schema';

/**
 * Fetch all approved reviews with images (public)
 */
export async function getApprovedReviews(): Promise<ReviewWithImages[]> {
  const supabase = await createAdminClient();
  
  const { data: reviews, error: reviewsError } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching approved reviews:', reviewsError);
    throw new Error('Failed to fetch reviews');
  }

  if (!reviews || reviews.length === 0) {
    return [];
  }

  // Fetch images for all reviews
  const reviewIds = reviews.map(r => r.id);
  const { data: images, error: imagesError } = await supabase
    .from('review_images')
    .select('*')
    .in('review_id', reviewIds)
    .order('display_order', { ascending: true });

  if (imagesError) {
    console.error('Error fetching review images:', imagesError);
    // Continue without images rather than failing
  }

  // Combine reviews with their images
  const reviewsWithImages: ReviewWithImages[] = reviews.map(review => ({
    ...review,
    images: images?.filter(img => img.review_id === review.id) || []
  }));

  return reviewsWithImages;
}

/**
 * Fetch all pending reviews with images (admin only)
 */
export async function getPendingReviews(): Promise<ReviewWithImages[]> {
  const supabase = await createAdminClient();
  
  const { data: reviews, error: reviewsError } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching pending reviews:', reviewsError);
    throw new Error('Failed to fetch pending reviews');
  }

  if (!reviews || reviews.length === 0) {
    return [];
  }

  // Fetch images for all reviews
  const reviewIds = reviews.map(r => r.id);
  const { data: images, error: imagesError } = await supabase
    .from('review_images')
    .select('*')
    .in('review_id', reviewIds)
    .order('display_order', { ascending: true });

  if (imagesError) {
    console.error('Error fetching review images:', imagesError);
  }

  // Combine reviews with their images
  const reviewsWithImages: ReviewWithImages[] = reviews.map(review => ({
    ...review,
    images: images?.filter(img => img.review_id === review.id) || []
  }));

  return reviewsWithImages;
}

/**
 * Approve a review (admin only)
 */
export async function approveReview(reviewId: string, userId: string): Promise<void> {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('customer_reviews')
    .update({
      is_approved: true,
      approved_by: userId,
      approved_at: new Date().toISOString()
    })
    .eq('id', reviewId);

  if (error) {
    console.error('Error approving review:', error);
    throw new Error('Failed to approve review');
  }
}

/**
 * Unapprove a review (admin only)
 */
export async function unapproveReview(reviewId: string): Promise<void> {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('customer_reviews')
    .update({
      is_approved: false,
      approved_by: null,
      approved_at: null
    })
    .eq('id', reviewId);

  if (error) {
    console.error('Error unapproving review:', error);
    throw new Error('Failed to unapprove review');
  }
}

/**
 * Delete a review and its images (admin only)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = await createAdminClient();
  
  // First, get all images for this review to delete from storage
  const { data: images } = await supabase
    .from('review_images')
    .select('image_path')
    .eq('review_id', reviewId);

  // Delete images from storage
  if (images && images.length > 0) {
    const imagePaths = images.map(img => img.image_path);
    const { error: storageError } = await supabase.storage
      .from('review-photos')
      .remove(imagePaths);

    if (storageError) {
      console.error('Error deleting images from storage:', storageError);
    }
  }

  // Delete the review (cascade will delete review_images records)
  const { error } = await supabase
    .from('customer_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
}

