import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

/**
 * Stripe client instance for server-side operations
 * Configured with the latest API version and TypeScript types
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
  appInfo: {
    name: 'Musical Insights',
    version: '1.0.0',
  },
});

/**
 * Helper function to format currency amounts
 * Stripe uses cents, so we need to convert to dollars
 */
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Helper function to convert dollars to cents for Stripe
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

