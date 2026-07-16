import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing progression id' }, { status: 400 });
    }

    const { error, count } = await adminClient
      .from('custom_interval_progressions')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id); // Ensures user can only delete their own progressions

    if (error) throw error;
    if (count === 0) {
      return NextResponse.json({ error: 'Progression not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom progression:', error);
    return NextResponse.json(
      { error: 'Failed to delete progression', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
