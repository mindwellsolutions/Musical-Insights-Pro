/**
 * User Manual Selections API Route
 * Handles GET and POST requests for user manual selections
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_manual_selections')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const selections = data.map(row => ({
      key: row.key,
      scaleName: row.scale_name,
      timestamp: row.timestamp,
    }));

    return NextResponse.json({ selections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { selections } = body;

    // Delete existing selections
    await supabase
      .from('user_manual_selections')
      .delete()
      .eq('user_id', user.id);

    // Insert new selections
    if (selections && selections.length > 0) {
      const { error } = await supabase
        .from('user_manual_selections')
        .insert(
          selections.map((sel: any) => ({
            user_id: user.id,
            key: sel.key,
            scale_name: sel.scaleName,
            timestamp: sel.timestamp,
          }))
        );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

