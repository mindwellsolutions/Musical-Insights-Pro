import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/system-settings
 * Retrieve system settings (admin only)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    if (userSettings?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get the setting key from query params (optional)
    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('key');

    const { data: settings, error } = settingKey
      ? await supabase.from('system_settings').select('*').eq('setting_key', settingKey).single()
      : await supabase.from('system_settings').select('*');

    if (error) {
      console.error('Error fetching system settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in GET /api/admin/system-settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/system-settings
 * Update system settings (admin only)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    if (userSettings?.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { setting_key, setting_value } = body;

    if (!setting_key || !setting_value) {
      return NextResponse.json(
        { error: 'setting_key and setting_value are required' },
        { status: 400 }
      );
    }

    // Update or insert the setting
    const { data: updatedSetting, error } = await supabase
      .from('system_settings')
      .upsert(
        {
          setting_key,
          setting_value,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'setting_key',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating system setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      setting: updatedSetting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/admin/system-settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

