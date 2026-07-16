/**
 * API Route: AI Assistant Conversations
 * GET /api/ai-assistant/conversations - List all conversations
 * POST /api/ai-assistant/conversations - Create new conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ConversationsResponse, CreateConversationRequest } from '@/lib/ai-assistant/chat-history-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET - List all conversations for authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const isArchived = searchParams.get('is_archived') === 'true' ? true : undefined;
    const sort = (searchParams.get('sort') || 'updated_at') as 'updated_at' | 'created_at' | 'title';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('ai_conversations')
      .select('id, title, preview_text, message_count, updated_at, created_at, is_archived', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,preview_text.ilike.%${search}%`);
    }
    if (isArchived !== undefined) {
      query = query.eq('is_archived', isArchived);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    const response: ConversationsResponse = {
      conversations: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in conversations GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Create new conversation
 */
export async function POST(request: NextRequest) {
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

    const body: CreateConversationRequest = await request.json();
    const title = body.title || 'New Conversation';

    // Create conversation
    const { data: conversation, error: createError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title,
        preview_text: body.firstMessage ? body.firstMessage.substring(0, 100) : null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // If first message provided, add it
    if (body.firstMessage && conversation) {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content: body.firstMessage,
        });
    }

    return NextResponse.json({ conversation, id: conversation.id });
  } catch (error) {
    console.error('Error in conversations POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

