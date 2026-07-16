import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/subscriptions/get-plans
 * Retrieve all active subscription plans
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Query subscription_plans table (public access for active plans)
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceMonthly: parseFloat(plan.price_monthly),
      priceYearly: plan.price_yearly ? parseFloat(plan.price_yearly) : null,
      interval: plan.interval,
      features: plan.features || [],
      stripePriceId: plan.stripe_price_id,
      stripeProductId: plan.stripe_product_id,
      maxProjects: plan.max_projects,
      maxStorageGb: plan.max_storage_gb,
      currency: plan.currency,
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Unexpected error in get-plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

