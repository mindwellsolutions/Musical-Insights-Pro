import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/subscriptions/get-subscription
 * Retrieve current user's subscription information
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query user_subscriptions with plan details
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price_monthly,
          price_yearly,
          interval,
          features,
          currency
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // If no subscription found, return null
    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Format subscription data
    const formattedSubscription = {
      id: subscription.id,
      status: subscription.status,
      planName: subscription.subscription_plans?.name || 'Unknown',
      planPrice: subscription.subscription_plans?.interval === 'year'
        ? parseFloat(subscription.subscription_plans?.price_yearly || '0')
        : parseFloat(subscription.subscription_plans?.price_monthly || '0'),
      interval: subscription.subscription_plans?.interval || 'month',
      currency: subscription.subscription_plans?.currency || 'usd',
      features: subscription.subscription_plans?.features || [],
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
      trialStart: subscription.trial_start,
      trialEnd: subscription.trial_end,
      stripeCustomerId: subscription.stripe_customer_id,
      stripeSubscriptionId: subscription.stripe_subscription_id,
    };

    return NextResponse.json({ subscription: formattedSubscription });
  } catch (error) {
    console.error('Unexpected error in get-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

