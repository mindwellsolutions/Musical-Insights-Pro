/**
 * API Route: Individual Conversation Operations
 * GET /api/ai-assistant/conversations/[id] - Get conversation with messages
 * PATCH /api/ai-assistant/conversations/[id] - Update conversation
 * DELETE /api/ai-assistant/conversations/[id] - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ConversationWithMessages, UpdateConversationRequest } from '@/lib/ai-assistant/chat-history-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET - Retrieve conversation with all messages
 */
export async function GET(
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

    // Await params before accessing properties
    const { id } = await params;
    const conversationId = id;

    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const response: ConversationWithMessages = {
      ...conversation,
      messages: messages || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in conversation GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH - Update conversation
 */
export async function PATCH(
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

    // Await params before accessing properties
    const { id } = await params;
    const conversationId = id;
    const body: UpdateConversationRequest = await request.json();

    // Update conversation
    const { data: conversation, error: updateError } = await supabase
      .from('ai_conversations')
      .update({
        ...(body.title !== undefined && { title: body.title }),
        ...(body.is_archived !== undefined && { is_archived: body.is_archived }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error in conversation PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Delete conversation and all messages
 */
export async function DELETE(
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

    // Await params before accessing properties
    const { id } = await params;
    const conversationId = id;

    // Delete conversation (messages will cascade delete)
    const { error: deleteError } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in conversation DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

