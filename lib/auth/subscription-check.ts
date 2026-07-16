import { createClient } from '@/lib/supabase/server';

export interface SubscriptionStatus {
  id: string;
  status: string;
  planName: string;
  planId: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  features: any[];
}

/**
 * Check if the subscription system is enabled globally
 * Returns true if enabled, false if disabled
 */
export async function isSubscriptionSystemEnabled(): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: setting, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'subscription_system')
      .single();

    if (error || !setting) {
      // Default to enabled if setting doesn't exist
      return true;
    }

    return setting.setting_value?.enabled ?? true;
  } catch (error) {
    console.error('Error checking subscription system status:', error);
    // Default to enabled on error
    return true;
  }
}

/**
 * Get subscription status for a user
 * Uses service role to bypass RLS
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus | null> {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          features
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      planName: subscription.subscription_plans?.name || 'Unknown',
      planId: subscription.subscription_plans?.id || '',
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      features: subscription.subscription_plans?.features || [],
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
}

/**
 * Check if user has an active subscription
 * Returns true if status is 'active' or 'trialing' and not expired
 * Also returns true if subscription system is disabled globally
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    // Check if subscription system is enabled
    const systemEnabled = await isSubscriptionSystemEnabled();
    if (!systemEnabled) {
      // If subscription system is disabled, allow access
      return true;
    }

    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return false;
    }

    // Check if subscription is active or trialing
    const isActiveStatus = ['active', 'trialing'].includes(subscription.status);

    // Check if not expired
    const notExpired = !subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date();

    return isActiveStatus && notExpired;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}

/**
 * Require active subscription or throw error
 * Use in protected API routes
 * Bypasses check if subscription system is disabled globally
 */
export async function requireActiveSubscription(
  userId: string
): Promise<SubscriptionStatus | null> {
  // Check if subscription system is enabled
  const systemEnabled = await isSubscriptionSystemEnabled();
  if (!systemEnabled) {
    // If subscription system is disabled, return null to indicate bypass
    return null;
  }

  const subscription = await getSubscriptionStatus(userId);

  if (!subscription) {
    throw new Error('No subscription found');
  }

  const isActive = ['active', 'trialing'].includes(subscription.status);
  const notExpired = !subscription.currentPeriodEnd ||
    new Date(subscription.currentPeriodEnd) > new Date();

  if (!isActive || !notExpired) {
    throw new Error('Active subscription required');
  }

  return subscription;
}

/**
 * Get subscription features for a user
 * Returns array of enabled features based on plan
 */
export async function getSubscriptionFeatures(userId: string): Promise<string[]> {
  const subscription = await getSubscriptionStatus(userId);

  if (!subscription) {
    return [];
  }

  return subscription.features || [];
}

/**
 * Check if user has a specific feature
 */
export async function hasFeature(userId: string, feature: string): Promise<boolean> {
  const features = await getSubscriptionFeatures(userId);
  return features.includes(feature);
}

