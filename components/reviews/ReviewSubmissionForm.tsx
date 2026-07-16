'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSubmissionSchema, ReviewSubmission, SERVICE_TYPES } from '@/lib/validations/review-schema';
import { StarRating } from './StarRating';
import { PhotoUploader } from './PhotoUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ReviewSubmissionFormProps {
  onSuccess?: () => void;
}

export function ReviewSubmissionForm({ onSuccess }: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ReviewSubmission>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: {
      rating: 5
    }
  });

  const onSubmit = async (data: ReviewSubmission) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('customer_name', data.customer_name);
      formData.append('customer_email', data.customer_email);
      formData.append('service_type', data.service_type);
      formData.append('rating', rating.toString());
      formData.append('review_text', data.review_text);
      
      if (data.event_date) {
        formData.append('event_date', data.event_date);
      }
      if (data.event_location) {
        formData.append('event_location', data.event_location);
      }

      // Append photos
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      setSubmitSuccess(true);
      reset();
      setRating(5);
      setPhotos([]);
      
      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      setSubmitError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Share Your Experience</CardTitle>
        <CardDescription>
          Tell us about your experience with Krys Wolf's services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you for your review! It will be published after approval.
            </AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="customer_name">Your Name *</Label>
            <Input
              id="customer_name"
              {...register('customer_name')}
              placeholder="John Doe"
              className={errors.customer_name ? 'border-red-500' : ''}
            />
            {errors.customer_name && (
              <p className="text-sm text-red-500">{errors.customer_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="customer_email">Email Address *</Label>
            <Input
              id="customer_email"
              type="email"
              {...register('customer_email')}
              placeholder="john@example.com"
              className={errors.customer_email ? 'border-red-500' : ''}
            />
            {errors.customer_email && (
              <p className="text-sm text-red-500">{errors.customer_email.message}</p>
            )}
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type *</Label>
            <Select onValueChange={(value) => setValue('service_type', value)}>
              <SelectTrigger className={errors.service_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_type && (
              <p className="text-sm text-red-500">{errors.service_type.message}</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating
              rating={rating}
              onRatingChange={(newRating) => {
                setRating(newRating);
                setValue('rating', newRating);
              }}
              size="lg"
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review_text">Your Review *</Label>
            <Textarea
              id="review_text"
              {...register('review_text')}
              placeholder="Tell us about your experience..."
              rows={6}
              className={errors.review_text ? 'border-red-500' : ''}
            />
            {errors.review_text && (
              <p className="text-sm text-red-500">{errors.review_text.message}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="event_date">Event Date (Optional)</Label>
            <Input
              id="event_date"
              type="date"
              {...register('event_date')}
            />
          </div>

          {/* Event Location */}
          <div className="space-y-2">
            <Label htmlFor="event_location">Event Location (Optional)</Label>
            <Input
              id="event_location"
              {...register('event_location')}
              placeholder="City, State"
            />
          </div>

          {/* Photo Upload */}
          <PhotoUploader
            onPhotosChange={setPhotos}
            maxPhotos={5}
            maxSizeMB={5}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


