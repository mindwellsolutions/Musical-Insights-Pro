'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Unlock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function SubscriptionRequiredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [fromPath, setFromPath] = useState<string | null>(null);
  const [isEnablingBypass, setIsEnablingBypass] = useState(false);

  useEffect(() => {
    setFromPath(searchParams.get('from'));
  }, [searchParams]);

  const handleBypassSubscription = async () => {
    setIsEnablingBypass(true);
    try {
      const response = await fetch('/api/user/set-subscription-bypass', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to enable bypass');
      }

      toast({
        title: 'Subscription Bypass Enabled',
        description: 'You can now access all features without a subscription.',
      });

      // Redirect to the original path or home
      setTimeout(() => {
        router.push(fromPath || '/');
      }, 1000);
    } catch (error) {
      console.error('Error enabling bypass:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable subscription bypass. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnablingBypass(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <CardDescription className="text-base">
            This feature requires an active subscription to access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fromPath && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                You tried to access: <span className="font-medium text-foreground">{fromPath}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">What you'll get with a subscription:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Access to all premium features and tools</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Unlimited chord progressions and projects</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Advanced music theory insights</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Priority support and updates</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={() => router.push('/pricing')}
              >
                View Pricing Plans
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Return Home
              </Button>
            </div>

            {/* Bypass Button for Testing */}
            <div className="border-t pt-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleBypassSubscription}
                disabled={isEnablingBypass}
              >
                <Unlock className="h-4 w-4 mr-2" />
                {isEnablingBypass ? 'Enabling Bypass...' : 'Bypass Subscription (Testing)'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                For testing purposes only
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionRequiredPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <SubscriptionRequiredContent />
    </Suspense>
  );
}
