'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
      });

      if (error) throw error;

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5"></div>
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            animationDelay: '1s'
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-2xl blur-xl opacity-40 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' }}
        ></div>

        {/* Reset password card */}
        <div
          className="relative backdrop-blur-xl rounded-2xl shadow-2xl p-8"
          style={{
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logo-whitetext.png"
                alt="Musical Insights Pro"
                width={240}
                height={54}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
              Reset Password
            </h2>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              {success
                ? 'Check your email for the reset link'
                : 'Enter your email to receive a password reset link'
              }
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <p className="text-sm" style={{ color: '#86efac' }}>
                Password reset email sent! Check your inbox and follow the instructions.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#ffffff' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid #333333',
                    color: '#ffffff'
                  }}
                  placeholder="you@example.com"
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#333333'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 font-semibold rounded-lg shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: loading ? '#0ea5e9' : 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(14, 165, 233, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(14, 165, 233, 0.4)';
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(51, 51, 51, 0.5)' }}
          >
            <Link
              href="/login"
              className="text-sm transition-colors"
              style={{ color: '#38bdf8' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#38bdf8'}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

