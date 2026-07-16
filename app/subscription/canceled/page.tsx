'use client';

import { XCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SubscriptionCanceledPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Background orb */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '30%', width: 350, height: 350, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)', position: 'relative', zIndex: 10 }}>
        <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Back to App
        </Link>
      </div>

      {/* Content Card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: 480, background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--mi-shadow-modal)' }}>
          {/* Icon */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.30)', marginBottom: 20 }}>
              <XCircle size={36} style={{ color: '#f59e0b' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mi-text-primary)', marginBottom: 8 }}>Checkout Canceled</h1>
            <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)' }}>Your subscription checkout was canceled. No charges were made.</p>
          </div>

          {/* Info */}
          <div style={{ background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-lg)', padding: 18 }}>
            <p style={{ fontSize: 13, color: 'var(--mi-text-secondary)', lineHeight: 1.65, margin: 0 }}>
              If you experienced any issues during checkout or have questions about our plans, please don&apos;t hesitate to contact our support team.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => router.push('/pricing')}
              style={{ flex: 1, height: 44, borderRadius: 'var(--mi-radius-md)', background: 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              View Plans Again
            </button>
            <button
              onClick={() => router.push('/')}
              style={{ flex: 1, height: 44, borderRadius: 'var(--mi-radius-md)', background: 'var(--mi-bg-elevated)', color: 'var(--mi-text-secondary)', fontSize: 14, fontWeight: 500, border: '1px solid var(--mi-border-medium)', cursor: 'pointer' }}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

