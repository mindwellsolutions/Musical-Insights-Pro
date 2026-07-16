'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number | null;
  interval: string;
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
  maxProjects: number | null;
  maxStorageGb: number | null;
  currency: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const response = await fetch('/api/subscriptions/get-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(plan: Plan) {
    setCheckoutLoading(plan.id);
    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start checkout');
      setCheckoutLoading(null);
    }
  }

  const getPrice = (plan: Plan) => {
    return isYearly && plan.priceYearly ? plan.priceYearly : plan.priceMonthly;
  };

  const getSavings = (plan: Plan) => {
    if (!plan.priceYearly) return 0;
    const yearlyMonthly = plan.priceYearly / 12;
    const savings = ((plan.priceMonthly - yearlyMonthly) / plan.priceMonthly) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: 'var(--mi-accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="animate-pulse" style={{ position: 'absolute', top: '-10%', left: '15%', width: 500, height: 500, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        <div className="animate-pulse" style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, borderRadius: '50%', filter: 'blur(80px)', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', animationDelay: '1.5s' }} />
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', position: 'relative', zIndex: 1 }}>
        <Image src="/images/logo-whitetext.png" width={140} height={32} alt="Musical Insights" style={{ objectFit: 'contain' }} />
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Back to App
        </Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 40px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--mi-text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>Choose Your Plan</h1>
        <p style={{ fontSize: 16, color: 'var(--mi-text-secondary)', marginBottom: 36 }}>Unlock the full potential of Musical Insights Pro</p>

        {/* Segmented Billing Toggle */}
        <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--mi-radius-full)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', padding: 4, width: 'fit-content', margin: '0 auto' }}>
          {['Monthly', 'Yearly'].map((opt) => (
            <button key={opt} onClick={() => setIsYearly(opt === 'Yearly')}
              style={{
                padding: '7px 22px', borderRadius: 'var(--mi-radius-full)', fontSize: 14, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: (opt === 'Yearly') === isYearly ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)' : 'transparent',
                color: (opt === 'Yearly') === isYearly ? '#fff' : 'var(--mi-text-secondary)',
                transition: 'all 0.18s ease',
              }}
            >
              {opt}{opt === 'Yearly' && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.85 }}>−20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', padding: '0 24px 80px', position: 'relative', zIndex: 1, alignItems: 'center' }}>
        {plans.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mi-text-muted)', fontSize: 15 }}>No plans available</div>
        )}
        {plans.map((plan) => {
          const price = getPrice(plan);
          const savings = getSavings(plan);
          const isPopular = plan.name.toLowerCase() === 'premium';

          return (
            <div key={plan.id} style={{
              width: 340, borderRadius: 'var(--mi-radius-xl)',
              background: 'var(--mi-bg-glass)',
              border: isPopular ? '1px solid var(--mi-accent-blue)' : '1px solid var(--mi-border-medium)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: isPopular ? 'var(--mi-shadow-glow-blue), var(--mi-shadow-modal)' : 'var(--mi-shadow-card)',
              padding: 32, display: 'flex', flexDirection: 'column', gap: 20,
              position: 'relative',
              transform: isPopular ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              {/* Popular badge */}
              {isPopular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 18px', borderRadius: 'var(--mi-radius-full)',
                  background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))',
                  fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
                }}>Most Popular</div>
              )}

              {/* Plan name */}
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--mi-text-primary)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: 'var(--mi-text-secondary)' }}>{plan.description}</div>
              </div>

              {/* Price */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--mi-text-primary)', lineHeight: 1 }}>${price.toFixed(2)}</span>
                  <span style={{ fontSize: 14, color: 'var(--mi-text-muted)', marginLeft: 4 }}>/{isYearly ? 'year' : 'mo'}</span>
                </div>
                {isYearly && savings > 0 && <div style={{ fontSize: 12, color: 'var(--mi-accent-green)', marginTop: 6 }}>Save {savings}% with yearly billing</div>}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--mi-text-secondary)' }}>
                    <Check size={16} style={{ color: 'var(--mi-accent-green)', flexShrink: 0, marginTop: 1 }} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button - NOT full-width */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 4 }}>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={checkoutLoading === plan.id}
                  style={{
                    minWidth: 160, maxWidth: 220, height: 44, borderRadius: 'var(--mi-radius-md)',
                    background: isPopular ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)' : 'var(--mi-bg-elevated)',
                    color: '#fff', fontSize: 15, fontWeight: 600,
                    border: isPopular ? 'none' : '1px solid var(--mi-border-medium)',
                    cursor: checkoutLoading === plan.id ? 'not-allowed' : 'pointer',
                    opacity: checkoutLoading === plan.id ? 0.7 : 1,
                    transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {checkoutLoading === plan.id ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : 'Get Started'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

