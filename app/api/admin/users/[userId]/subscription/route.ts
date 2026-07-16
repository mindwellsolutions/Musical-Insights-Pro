import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/users/[userId]/subscription
 * Get detailed subscription information for a specific user (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    // Check if user is admin
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    if (!userSettings || (userSettings.user_type !== 'admin' && userSettings.user_type !== 'moderator')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Get subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          description,
          price_monthly,
          price_yearly,
          interval,
          features,
          currency
        )
      `)
      .eq('user_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    // Get invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get subscription events
    const { data: events } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate financial metrics
    const totalPaid = invoices?.reduce(
      (sum, inv) => sum + parseFloat(inv.amount_paid || 0),
      0
    ) || 0;

    const outstandingBalance = invoices
      ?.filter((inv) => inv.status !== 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount_due || 0), 0) || 0;

    const successfulPayments = invoices?.filter((inv) => inv.status === 'paid').length || 0;
    const totalPayments = invoices?.length || 0;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    // Calculate MRR for this user
    let mrr = 0;
    if (subscription && subscription.subscription_plans) {
      const plan = subscription.subscription_plans;
      if (plan.interval === 'month') {
        mrr = parseFloat(plan.price_monthly || 0);
      } else if (plan.interval === 'year' && plan.price_yearly) {
        mrr = parseFloat(plan.price_yearly) / 12;
      }
    }

    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        planName: subscription.subscription_plans?.name || 'Unknown',
        planPrice: subscription.subscription_plans?.price_monthly || 0,
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
        createdAt: subscription.created_at,
      } : null,
      invoices: invoices || [],
      events: events || [],
      financialSummary: {
        lifetimeValue: totalPaid,
        mrr,
        totalPaid,
        outstandingBalance,
        averageInvoice: totalPayments > 0 ? totalPaid / totalPayments : 0,
        paymentSuccessRate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

