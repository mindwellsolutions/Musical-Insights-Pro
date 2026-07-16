import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-client';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for real-time subscription updates
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Get Supabase client with service role
  const supabase = await createClient();

  try {
    // Check if event already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('subscription_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', event.id);
      return NextResponse.json({ received: true });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_action_required':
        await handleInvoicePaymentActionRequired(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log event
    await supabase.from('subscription_events').insert({
      event_type: event.type,
      stripe_event_id: event.id,
      event_data: event.data.object,
      processed: true,
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Still return 200 to acknowledge receipt
    return NextResponse.json({ received: true, error: error.message });
  }
}

// Helper function to get user ID from customer ID
async function getUserIdFromCustomer(customerId: string, supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  return data?.user_id || null;
}

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.user_id;

  if (!userId || !customerId) {
    console.error('Missing user_id or customer_id in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Create or update user_subscriptions record
  const subscriptionData = subscription as any;
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_plan_id: session.metadata?.plan_id,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      trial_start: subscriptionData.trial_start ? new Date(subscriptionData.trial_start * 1000).toISOString() : null,
      trial_end: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error creating subscription record:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const subscriptionData = subscription as any;
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionData.id,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      trial_start: subscriptionData.trial_start ? new Date(subscriptionData.trial_start * 1000).toISOString() : null,
      trial_end: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000).toISOString() : null,
      metadata: subscriptionData.metadata,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const subscriptionData = subscription as any;
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
      canceled_at: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at * 1000).toISOString() : null,
      trial_start: subscriptionData.trial_start ? new Date(subscriptionData.trial_start * 1000).toISOString() : null,
      trial_end: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000).toISOString() : null,
      metadata: subscriptionData.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionData.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deleting subscription:', error);
  }
}

// Handle invoice paid
async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Create or update invoice record
  const invoiceData = invoice as any;
  const { error } = await supabase
    .from('invoices')
    .upsert({
      user_id: userId,
      stripe_invoice_id: invoiceData.id,
      stripe_subscription_id: invoiceData.subscription as string,
      amount_due: invoiceData.amount_due / 100,
      amount_paid: invoiceData.amount_paid / 100,
      currency: invoiceData.currency,
      status: 'paid',
      invoice_pdf: invoiceData.invoice_pdf,
      hosted_invoice_url: invoiceData.hosted_invoice_url,
      invoice_number: invoiceData.number,
      billing_reason: invoiceData.billing_reason,
      period_start: invoiceData.period_start ? new Date(invoiceData.period_start * 1000).toISOString() : null,
      period_end: invoiceData.period_end ? new Date(invoiceData.period_end * 1000).toISOString() : null,
      due_date: invoiceData.due_date ? new Date(invoiceData.due_date * 1000).toISOString() : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_invoice_id',
    });

  if (error) {
    console.error('Error creating invoice record:', error);
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status to past_due
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  // Create invoice record
  const invoiceData = invoice as any;
  await supabase
    .from('invoices')
    .upsert({
      user_id: userId,
      stripe_invoice_id: invoiceData.id,
      stripe_subscription_id: invoiceData.subscription as string,
      amount_due: invoiceData.amount_due / 100,
      amount_paid: invoiceData.amount_paid / 100,
      currency: invoiceData.currency,
      status: 'open',
      invoice_pdf: invoiceData.invoice_pdf,
      hosted_invoice_url: invoiceData.hosted_invoice_url,
      invoice_number: invoiceData.number,
      billing_reason: invoiceData.billing_reason,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_invoice_id',
    });
}

// Handle invoice payment action required
async function handleInvoicePaymentActionRequired(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'incomplete',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

// Handle trial will end
async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string;
  const userId = await getUserIdFromCustomer(customerId, supabase);

  if (!userId) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Log event for notification purposes
  console.log(`Trial ending soon for user ${userId}`);
  // TODO: Send email notification
}

