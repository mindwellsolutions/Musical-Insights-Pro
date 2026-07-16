import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const { data, error, count } = await adminClient
      .from('custom_interval_progressions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map snake_case DB columns to camelCase for the frontend
    const progressions = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      steps: row.steps,
      key: row.key,
      scale: row.scale,
      source: row.source,
      aiMetadata: row.ai_metadata,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ progressions, total: count ?? 0 });
  } catch (error) {
    console.error('Error listing custom progressions:', error);
    return NextResponse.json(
      { error: 'Failed to list progressions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
