import { z } from 'zod';

/**
 * Validation schema for customer review submission
 */
export const reviewSubmissionSchema = z.object({
  customer_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  customer_email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  service_type: z.string()
    .min(1, 'Please select a service type'),
  
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  
  review_text: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be less than 2000 characters'),
  
  event_date: z.string()
    .optional()
    .nullable(),
  
  event_location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .nullable(),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

/**
 * Service type options for reviews
 */
export const SERVICE_TYPES = [
  'DJ Services',
  'Music Production',
  'Live Performance',
  'Sound Engineering',
  'Music Lessons',
  'Event Planning',
  'Other'
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

/**
 * Validation schema for photo upload
 */
export const photoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
});

/**
 * Database types
 */
export interface CustomerReview {
  id: string;
  customer_name: string;
  customer_email: string;
  service_type: string;
  rating: number;
  review_text: string;
  event_date: string | null;
  event_location: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  image_path: string;
  display_order: number;
  created_at: string;
}

export interface ReviewWithImages extends CustomerReview {
  images: ReviewImage[];
}

