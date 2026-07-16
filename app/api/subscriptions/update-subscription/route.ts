import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/stripe-client';

/**
 * POST /api/subscriptions/update-subscription
 * Upgrade or downgrade subscription plan
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { newPriceId, prorationBehavior = 'create_prorations' } = body;

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'New price ID is required' },
        { status: 400 }
      );
    }

    // Validate new price ID
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', newPriceId)
      .eq('is_active', true)
      .single();

    if (planError || !newPlan) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Retrieve current subscription
    const { data: currentSubscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !currentSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripe_subscription_id
    );

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripe_subscription_id,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: prorationBehavior as any,
        metadata: {
          user_id: user.id,
          plan_id: newPlan.id,
        },
      }
    );

    // Update database
    const supabaseAdmin = await createClient();
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        subscription_plan_id: newPlan.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSubscription.id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
    }

    // Log event
    await supabaseAdmin.from('subscription_events').insert({
      user_id: user.id,
      subscription_id: currentSubscription.id,
      event_type: 'subscription.plan_changed',
      event_data: {
        old_plan_id: currentSubscription.subscription_plan_id,
        new_plan_id: newPlan.id,
        proration_behavior: prorationBehavior,
      },
      processed: true,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: (updatedSubscription as any).current_period_end,
      },
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

