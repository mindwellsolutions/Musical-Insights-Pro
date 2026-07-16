'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--mi-bg-void)', position: 'relative', overflow: 'hidden' }}>
      {/* Top-left home link */}
      <Link href="/" style={{ position: 'absolute', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2, opacity: 0.8 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
      >
        <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Home" style={{ objectFit: 'contain' }} />
      </Link>

      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="animate-pulse" style={{ position: 'absolute', top: 0, left: '25%', width: 384, height: 384, borderRadius: '50%', filter: 'blur(64px)', opacity: 0.15, background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
        <div className="animate-pulse" style={{ position: 'absolute', bottom: 0, right: '25%', width: 384, height: 384, borderRadius: '50%', filter: 'blur(64px)', opacity: 0.15, background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', animationDelay: '1s' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, zIndex: 1 }}>
        {/* Glow halo */}
        <div className="animate-pulse" style={{ position: 'absolute', inset: -4, borderRadius: 28, filter: 'blur(20px)', opacity: 0.3, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', pointerEvents: 'none' }} />

        {/* Login card - glassmorphism */}
        <div style={{
          position: 'relative', backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderRadius: 'var(--mi-radius-xl)', padding: 40,
          background: 'var(--mi-bg-glass)',
          border: '1px solid var(--mi-border-medium)',
          boxShadow: 'var(--mi-shadow-modal), var(--mi-shadow-inset)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Image src="/images/logo-whitetext.png" alt="Musical Insights Pro" width={220} height={50} priority style={{ objectFit: 'contain' }} />
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--mi-text-secondary)' }}>Sign in to your account</p>
          </div>

          {/* Error message with icon */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 24 }}>
              <AlertCircle size={16} style={{ color: '#fca5a5', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mi-text-primary)', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={loading}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--mi-radius-md)', background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
                onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.20), 0 0 0 1px rgba(14,165,233,0.60)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mi-text-primary)', marginBottom: 8 }}>
                Password
              </label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={loading}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--mi-radius-md)', background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
                onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.20), 0 0 0 1px rgba(14,165,233,0.60)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px 16px', fontSize: 15, fontWeight: 600, borderRadius: 'var(--mi-radius-md)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: '#fff', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(14,165,233,0.5)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(14,165,233,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Forgot password - below submit */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/reset-password" style={{ fontSize: 13, color: 'var(--mi-text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--mi-text-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--mi-text-muted)'; }}
            >Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

