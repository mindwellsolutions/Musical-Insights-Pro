'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, CreditCard, FileText, AlertCircle, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  status: string;
  planName: string;
  planPrice: number;
  interval: string;
  currency: string;
  features: string[];
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
}

export default function ManageSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, []);

  async function fetchSubscription() {
    try {
      const response = await fetch('/api/subscriptions/get-subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoices() {
    try {
      const response = await fetch('/api/invoices/get-invoices?limit=5');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  }

  async function openCustomerPortal() {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error opening portal:', error);
      toast.error(error.message || 'Failed to open customer portal');
      setPortalLoading(false);
    }
  }

  const getStatusStyle = (status: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      active: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.30)' },
      trialing: { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.30)' },
      past_due: { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.30)' },
      canceled: { background: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.30)' },
    };
    return { padding: '3px 10px', borderRadius: 'var(--mi-radius-full)', fontSize: 12, fontWeight: 700, ...(styles[status] || styles.canceled) };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 28, height: 28, color: 'var(--mi-accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <AlertCircle size={40} style={{ color: 'var(--mi-text-muted)' }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-text-primary)', marginBottom: 8 }}>No Active Subscription</h2>
          <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)' }}>You don&apos;t have an active subscription yet.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/pricing')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)', color: '#fff', border: 'none', borderRadius: 'var(--mi-radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            View Pricing Plans
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', color: 'var(--mi-text-secondary)', borderRadius: 'var(--mi-radius-md)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronLeft size={14} /> Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>
      {/* Page Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'var(--mi-border-medium)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-text-secondary)' }}>Manage Subscription</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Back to App
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Current Plan Card */}
        <div style={{ background: 'var(--mi-bg-surface)', border: subscription.status === 'active' ? '1px solid var(--mi-border-accent)' : '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-lg)', padding: 24, boxShadow: subscription.status === 'active' ? 'var(--mi-shadow-glow-blue)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} style={{ color: 'var(--mi-accent-blue)' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mi-text-primary)' }}>Current Plan</span>
            </div>
            <span style={getStatusStyle(subscription.status)}>{subscription.status.replace('_', ' ').toUpperCase()}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--mi-text-primary)' }}>{subscription.planName}</div>
            <div style={{ fontSize: 14, color: 'var(--mi-text-secondary)', marginTop: 4 }}>
              {formatCurrency(subscription.planPrice, subscription.currency)} / {subscription.interval}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--mi-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Current Period</div>
              <div style={{ fontSize: 13, color: 'var(--mi-text-secondary)' }}>{formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}</div>
            </div>
            {subscription.trialEnd && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--mi-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Trial Ends</div>
                <div style={{ fontSize: 13, color: 'var(--mi-text-secondary)' }}>{formatDate(subscription.trialEnd)}</div>
              </div>
            )}
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 13, color: '#fbbf24', marginBottom: 16 }}>
              ⚠️ Your subscription will be canceled on {formatDate(subscription.currentPeriodEnd)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)', color: '#fff', border: 'none', borderRadius: 'var(--mi-radius-md)', fontSize: 14, fontWeight: 600, cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.7 : 1, minWidth: 160 }}
            >
              {portalLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={14} />}
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>

          {/* Features list */}
          {subscription.features && subscription.features.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--mi-border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mi-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Included Features</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subscription.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--mi-text-secondary)' }}>
                    <Check size={14} style={{ color: 'var(--mi-accent-green)', flexShrink: 0, marginTop: 1 }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Billing History */}
        {invoices.length > 0 && (
          <div style={{ background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--mi-border-medium)', background: 'var(--mi-bg-elevated)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--mi-text-primary)' }}>Billing History</div>
              <div style={{ fontSize: 12, color: 'var(--mi-text-muted)', marginTop: 2 }}>Your recent invoices</div>
            </div>
            <div>
              {invoices.map((invoice, idx) => (
                <div key={invoice.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: idx < invoices.length - 1 ? '1px solid var(--mi-border-subtle)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mi-text-primary)' }}>{invoice.invoiceNumber || 'Invoice'}</div>
                    <div style={{ fontSize: 12, color: 'var(--mi-text-muted)', marginTop: 2 }}>{formatDate(invoice.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mi-text-primary)' }}>{formatCurrency(invoice.amountPaid, invoice.currency)}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--mi-radius-full)', background: invoice.status === 'paid' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: invoice.status === 'paid' ? '#22c55e' : '#9ca3af', border: `1px solid ${invoice.status === 'paid' ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.3)'}` }}>
                        {invoice.status}
                      </span>
                    </div>
                    {invoice.hostedInvoiceUrl && (
                      <button onClick={() => window.open(invoice.hostedInvoiceUrl!, '_blank')} style={{ display: 'flex', alignItems: 'center', padding: '6px', borderRadius: 6, background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', cursor: 'pointer', color: 'var(--mi-text-secondary)' }}>
                        <FileText size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

