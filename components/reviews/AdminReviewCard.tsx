'use client';

import { ReviewWithImages } from '@/lib/validations/review-schema';
import { StarRating } from './StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Mail, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PhotoGallery } from './PhotoGallery';

interface AdminReviewCardProps {
  review: ReviewWithImages;
  onApprove?: (reviewId: string) => void;
  onUnapprove?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  isApproved?: boolean;
}

/**
 * AdminReviewCard Component
 * Displays review with admin actions (approve/reject/delete)
 */
export function AdminReviewCard({
  review,
  onApprove,
  onUnapprove,
  onDelete,
  isApproved = false
}: AdminReviewCardProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    if (onApprove) {
      await onApprove(review.id);
    }
    setIsProcessing(false);
  };

  const handleUnapprove = async () => {
    setIsProcessing(true);
    if (onUnapprove) {
      await onUnapprove(review.id);
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      setIsProcessing(true);
      if (onDelete) {
        await onDelete(review.id);
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {review.customer_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{review.customer_email}</span>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>
            <Badge variant={isApproved ? 'default' : 'secondary'}>
              {review.service_type}
            </Badge>
          </div>

          {/* Review Text */}
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {review.review_text}
          </p>

          {/* Event Details */}
          {(review.event_date || review.event_location) && (
            <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
              {review.event_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.event_date)}</span>
                </div>
              )}
              {review.event_location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{review.event_location}</span>
                </div>
              )}
            </div>
          )}

          {/* Photo Gallery */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {review.images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={image.image_url}
                    alt={`Event photo ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submission Date */}
          <p className="text-xs text-gray-500 mb-4">
            Submitted on {formatDate(review.created_at)}
          </p>

          {/* Admin Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!isApproved ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleUnapprove}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Unapprove
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <PhotoGallery
          images={review.images}
          initialIndex={selectedImageIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}

