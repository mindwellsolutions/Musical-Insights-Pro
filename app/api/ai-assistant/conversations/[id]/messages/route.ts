/**
 * API Route: Conversation Messages
 * POST /api/ai-assistant/conversations/[id]/messages - Add message to conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { AddMessageRequest } from '@/lib/ai-assistant/chat-history-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST - Add message to conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = id;
    const body: AddMessageRequest = await request.json();

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Add message
    const { data: message, error: messageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: body.role,
        content: body.content,
        tokens_used: body.tokens_used || null,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error adding message:', messageError);
      return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

