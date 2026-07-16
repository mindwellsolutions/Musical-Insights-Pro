import { getApprovedReviews } from '@/lib/supabase/reviews-service';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Star, MessageSquarePlus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Public Reviews Page
 * Displays all approved customer reviews
 */
export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Navigation Header */}
      <header style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'var(--mi-border-medium)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-text-secondary)' }}>Customer Reviews</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Back to App
        </Link>
      </header>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '56px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <Star size={28} style={{ color: '#facc15', fill: '#facc15' }} />
          <h1 style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Customer Reviews
          </h1>
          <Star size={28} style={{ color: '#facc15', fill: '#facc15' }} />
        </div>
        <p style={{ fontSize: 16, color: 'var(--mi-text-secondary)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          See what our clients are saying about Krys Wolf&apos;s services
        </p>
        <Link
          href="/reviews/submit"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))', color: '#fff', borderRadius: 'var(--mi-radius-md)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          <MessageSquarePlus size={16} /> Leave a Review
        </Link>
      </div>

      {/* Stats Row */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 24px 48px', flexWrap: 'wrap' }}>
          {[
            { value: reviews.length.toString(), label: 'Total Reviews', color: 'var(--mi-accent-violet)' },
            { value: avgRating, label: 'Average Rating', color: '#facc15' },
            { value: fiveStarCount.toString(), label: '5-Star Reviews', color: 'var(--mi-accent-blue)' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ width: 180, background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-lg)', padding: '24px 20px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--mi-text-muted)', marginTop: 8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px' }}>
        {reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Star size={56} style={{ color: 'var(--mi-border-medium)', margin: '0 auto 20px', display: 'block' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-text-secondary)', marginBottom: 10 }}>No Reviews Yet</h2>
            <p style={{ fontSize: 14, color: 'var(--mi-text-muted)', marginBottom: 24 }}>Be the first to share your experience!</p>
            <Link
              href="/reviews/submit"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))', color: '#fff', borderRadius: 'var(--mi-radius-md)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              <MessageSquarePlus size={16} /> Leave the First Review
            </Link>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div style={{ textAlign: 'center', paddingBottom: 32, fontSize: 13, color: 'var(--mi-text-muted)' }}>
        All reviews are verified and approved before being published
      </div>
    </div>
  );
}

