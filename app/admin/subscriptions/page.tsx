'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { SubscriptionAnalytics } from '@/components/admin/SubscriptionAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminCheck();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Subscription Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor subscription metrics and revenue
        </p>
      </div>

      {/* Analytics */}
      <SubscriptionAnalytics />
    </div>
  );
}

