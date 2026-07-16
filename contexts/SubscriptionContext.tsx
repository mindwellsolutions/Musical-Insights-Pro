'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

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

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  isActive: boolean;
  isTrial: boolean;
  daysUntilRenewal: number;
  refetch: () => Promise<any>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

async function fetchSubscription(): Promise<Subscription | null> {
  const response = await fetch('/api/subscriptions/get-subscription');
  if (!response.ok) {
    throw new Error('Failed to fetch subscription');
  }
  const data = await response.json();
  return data.subscription;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Calculate if subscription is active
  const isActive = subscription
    ? ['active', 'trialing'].includes(subscription.status) &&
      (!subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) > new Date())
    : false;

  // Check if in trial
  const isTrial = subscription?.status === 'trialing';

  // Calculate days until renewal
  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const value: SubscriptionContextType = {
    subscription: subscription || null,
    isLoading,
    isActive,
    isTrial,
    daysUntilRenewal,
    refetch,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

