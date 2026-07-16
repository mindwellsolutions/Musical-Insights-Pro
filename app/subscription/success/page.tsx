'use client';

import { Suspense, useEffect, useState } from 'react';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const WHATS_NEXT = [
  'You now have access to all premium features',
  'Start creating unlimited chord progressions',
  'Explore advanced music theory tools',
  'A confirmation email has been sent to your inbox',
];

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams.get('session_id');
    setSessionId(session);
    setTimeout(() => setLoading(false), 2000);
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--mi-text-primary)' }}>
        <Loader2 size={32} style={{ color: 'var(--mi-accent-blue)', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 15, color: 'var(--mi-text-secondary)' }}>Processing your subscription...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '20%', width: 400, height: 400, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)', position: 'relative', zIndex: 10 }}>
        <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          Back to App
        </Link>
      </div>

      {/* Content Card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: 480, background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-accent)', borderRadius: 'var(--mi-radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', gap: 28, boxShadow: 'var(--mi-shadow-glow-blue), var(--mi-shadow-modal)' }}>
          {/* Icon */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', marginBottom: 20 }}>
              <CheckCircle size={36} style={{ color: '#22c55e' }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--mi-text-primary)', marginBottom: 8 }}>Welcome to Musical Insights!</h1>
            <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)' }}>Your subscription has been activated successfully.</p>
          </div>

          {/* What's Next */}
          <div style={{ background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={15} style={{ color: 'var(--mi-accent-blue)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mi-text-primary)' }}>What&apos;s Next?</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WHATS_NEXT.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--mi-text-secondary)' }}>
                  <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {sessionId && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--mi-text-muted)' }}>Session: {sessionId}</div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => router.push('/')}
              style={{ flex: 1, height: 44, borderRadius: 'var(--mi-radius-md)', background: 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Start Exploring
            </button>
            <button
              onClick={() => router.push('/subscription/manage')}
              style={{ flex: 1, height: 44, borderRadius: 'var(--mi-radius-md)', background: 'var(--mi-bg-elevated)', color: 'var(--mi-text-secondary)', fontSize: 14, fontWeight: 500, border: '1px solid var(--mi-border-medium)', cursor: 'pointer' }}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: 'var(--mi-accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
