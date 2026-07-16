import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify JWT and extract user_id
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, steps, key, scale, source, aiMetadata } = body;

    if (!name || !steps || !Array.isArray(steps) || steps.length < 1 || !key || !scale || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['manual', 'ai'].includes(source)) {
      return NextResponse.json({ error: 'Invalid source value' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('custom_interval_progressions')
      .insert({
        user_id: user.id,
        name: name.trim().slice(0, 120),
        steps,
        key,
        scale,
        source,
        ai_metadata: aiMetadata ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ progression: data }, { status: 201 });
  } catch (error) {
    console.error('Error saving custom progression:', error);
    return NextResponse.json(
      { error: 'Failed to save progression', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
