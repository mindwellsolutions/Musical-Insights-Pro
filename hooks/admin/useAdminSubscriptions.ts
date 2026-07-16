import { useQuery } from '@tanstack/react-query';

interface SubscriptionAnalytics {
  totalSubscribers: number;
  statusCounts: {
    active: number;
    trialing: number;
    past_due: number;
    canceled: number;
  };
  planCounts: Record<string, { count: number; revenue: number }>;
  mrr: number;
  arr: number;
  newSubscribers: number;
  churnedSubscribers: number;
  churnRate: number;
  totalRevenue: number;
}

interface UserSubscriptionDetails {
  subscription: {
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
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    createdAt: string;
  } | null;
  invoices: any[];
  events: any[];
  financialSummary: {
    lifetimeValue: number;
    mrr: number;
    totalPaid: number;
    outstandingBalance: number;
    averageInvoice: number;
    paymentSuccessRate: number;
  };
}

/**
 * Hook to fetch subscription analytics for admin dashboard
 */
export function useAdminSubscriptionAnalytics() {
  return useQuery<SubscriptionAnalytics>({
    queryKey: ['admin', 'subscriptions', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/subscriptions/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription analytics');
      }
      const data = await response.json();
      return data.analytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch detailed subscription information for a specific user
 */
export function useAdminUserSubscription(userId: string | null) {
  return useQuery<UserSubscriptionDetails>({
    queryKey: ['admin', 'users', userId, 'subscription'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const response = await fetch(`/api/admin/users/${userId}/subscription`);
      if (!response.ok) {
        throw new Error('Failed to fetch user subscription');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

