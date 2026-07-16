import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/user/set-subscription-bypass
 * Sets the subscription_bypass flag to true for the authenticated user
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

    // Update subscription_bypass to true
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({ subscription_bypass: true })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating subscription_bypass:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription bypass' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription bypass enabled',
    });
  } catch (error) {
    console.error('Error in set-subscription-bypass:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

