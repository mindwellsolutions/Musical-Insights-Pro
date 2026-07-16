'use client';

import { ReviewWithImages } from '@/lib/validations/review-schema';
import { StarRating } from './StarRating';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PhotoGallery } from './PhotoGallery';

interface ReviewCardProps {
  review: ReviewWithImages;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatCustomerName = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name;
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  return (
    <>
      <div
        style={{
          background: 'var(--mi-bg-surface)',
          border: '1px solid var(--mi-border-medium)',
          borderRadius: 'var(--mi-radius-lg)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mi-border-accent)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mi-shadow-glow-blue)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mi-border-medium)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--mi-text-primary)', marginBottom: 4 }}>
              {formatCustomerName(review.customer_name)}
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>
          {review.service_type && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--mi-radius-full)', background: 'var(--mi-accent-violet-dim)', color: 'var(--mi-accent-violet)', border: '1px solid rgba(139,92,246,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {review.service_type}
            </span>
          )}
        </div>

        {/* Review Text */}
        <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)', lineHeight: 1.65, margin: 0 }}>
          {review.review_text}
        </p>

        {/* Event Details */}
        {(review.event_date || review.event_location) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {review.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--mi-text-muted)' }}>
                <Calendar size={13} /> {formatDate(review.event_date)}
              </div>
            )}
            {review.event_location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--mi-text-muted)' }}>
                <MapPin size={13} /> {review.event_location}
              </div>
            )}
          </div>
        )}

        {/* Photo Grid */}
        {review.images && review.images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {review.images.slice(0, 3).map((image, index) => (
              <div
                key={image.id}
                style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => handleImageClick(index)}
              >
                <Image src={image.image_url} alt={`Photo ${index + 1}`} fill style={{ objectFit: 'cover', transition: 'transform 300ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                />
                {index === 2 && review.images.length > 3 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>+{review.images.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer date */}
        <div style={{ fontSize: 11, color: 'var(--mi-text-muted)', borderTop: '1px solid var(--mi-border-subtle)', paddingTop: 10 }}>
          Reviewed on {formatDate(review.created_at)}
        </div>
      </div>

      {showGallery && (
        <PhotoGallery images={review.images} initialIndex={selectedImageIndex} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}

