'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password');
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
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
            animationDelay: '1s'
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-2xl blur-xl opacity-40 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}
        ></div>

        {/* Update password card */}
        <div
          className="relative backdrop-blur-xl rounded-2xl shadow-2xl p-8"
          style={{
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
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
              Update Password
            </h2>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              Enter your new password
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
                Password updated successfully! Redirecting to login...
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
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#ffffff' }}
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid #333333',
                    color: '#ffffff'
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#333333'}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#ffffff' }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid #333333',
                    color: '#ffffff'
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#333333'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 font-semibold rounded-lg shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  background: loading ? '#2563eb' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.4)';
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Password'
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
              style={{ color: '#60a5fa' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

