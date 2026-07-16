import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/stripe-client';

/**
 * POST /api/subscriptions/cancel-subscription
 * Cancel user's subscription at period end or immediately
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
    const { immediately = false } = body;

    // Retrieve subscription from database
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe
    let canceledSubscription;
    if (immediately) {
      canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
    } else {
      canceledSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );
    }

    // Update database using service role
    const supabaseAdmin = await createClient();
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: !immediately,
        canceled_at: immediately ? new Date().toISOString() : null,
        status: immediately ? 'canceled' : subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
    }

    // Log event
    await supabaseAdmin.from('subscription_events').insert({
      user_id: user.id,
      subscription_id: subscription.id,
      event_type: immediately ? 'subscription.canceled.immediately' : 'subscription.canceled.at_period_end',
      event_data: {
        subscription_id: subscription.stripe_subscription_id,
        canceled_at: new Date().toISOString(),
      },
      processed: true,
    });

    return NextResponse.json({
      success: true,
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the billing period',
      cancelAt: immediately ? new Date().toISOString() : subscription.current_period_end,
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

