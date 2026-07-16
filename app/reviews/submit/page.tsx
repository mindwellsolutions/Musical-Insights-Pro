'use client';

import { ReviewSubmissionForm } from '@/components/reviews/ReviewSubmissionForm';
import { ChevronLeft, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Review Submission Page
 * Public page where customers can submit reviews
 */
export default function ReviewSubmitPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Navigation Header */}
      <header style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'var(--mi-border-medium)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-text-secondary)' }}>Leave a Review</span>
        </div>
        <Link href="/reviews" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Back to Reviews
        </Link>
      </header>

      {/* Page Title */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <MessageSquarePlus size={24} style={{ color: 'var(--mi-accent-blue)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Leave a Review
          </h1>
        </div>
        <p style={{ fontSize: 15, color: 'var(--mi-text-secondary)', margin: 0 }}>
          Share your experience with Krys Wolf&apos;s services
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 64px' }}>
        <ReviewSubmissionForm />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--mi-text-muted)', marginTop: 20 }}>
          Your review will be published after approval. We appreciate your feedback!
        </p>
      </div>
    </div>
  );
}

