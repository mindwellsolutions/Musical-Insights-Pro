import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/subscriptions/analytics
 * Get subscription analytics for admin dashboard
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
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

    // Get total subscribers
    const { count: totalSubscribers } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Get active subscriptions by status
    const { data: subscriptionsByStatus } = await supabase
      .from('user_subscriptions')
      .select('status')
      .in('status', ['active', 'trialing', 'past_due', 'canceled']);

    const statusCounts = {
      active: 0,
      trialing: 0,
      past_due: 0,
      canceled: 0,
    };

    subscriptionsByStatus?.forEach((sub) => {
      if (sub.status in statusCounts) {
        statusCounts[sub.status as keyof typeof statusCounts]++;
      }
    });

    // Get subscriptions by plan
    const { data: subscriptionsByPlan } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_plans (
          id,
          name,
          price_monthly
        )
      `)
      .in('status', ['active', 'trialing']);

    const planCounts: Record<string, { count: number; revenue: number }> = {};
    subscriptionsByPlan?.forEach((sub: any) => {
      const plan = sub.subscription_plans;
      if (plan) {
        if (!planCounts[plan.name]) {
          planCounts[plan.name] = { count: 0, revenue: 0 };
        }
        planCounts[plan.name].count++;
        planCounts[plan.name].revenue += parseFloat(plan.price_monthly || 0);
      }
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const { data: activeSubscriptions } = await supabase
      .from('user_subscriptions')
      .select(`
        subscription_plans (
          price_monthly,
          price_yearly,
          interval
        )
      `)
      .in('status', ['active', 'trialing']);

    let totalMRR = 0;
    activeSubscriptions?.forEach((sub: any) => {
      const plan = sub.subscription_plans;
      if (plan) {
        if (plan.interval === 'month') {
          totalMRR += parseFloat(plan.price_monthly || 0);
        } else if (plan.interval === 'year' && plan.price_yearly) {
          totalMRR += parseFloat(plan.price_yearly) / 12;
        }
      }
    });

    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newSubscribers } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get churn count (canceled in last 30 days)
    const { count: churnedSubscribers } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('canceled_at', thirtyDaysAgo.toISOString());

    // Get total revenue from paid invoices
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('amount_paid')
      .eq('status', 'paid');

    const totalRevenue = paidInvoices?.reduce(
      (sum, invoice) => sum + parseFloat(invoice.amount_paid || 0),
      0
    ) || 0;

    return NextResponse.json({
      analytics: {
        totalSubscribers: totalSubscribers || 0,
        statusCounts,
        planCounts,
        mrr: totalMRR,
        arr: totalMRR * 12, // Annual Recurring Revenue
        newSubscribers: newSubscribers || 0,
        churnedSubscribers: churnedSubscribers || 0,
        churnRate: totalSubscribers ? ((churnedSubscribers || 0) / totalSubscribers) * 100 : 0,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscription analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

