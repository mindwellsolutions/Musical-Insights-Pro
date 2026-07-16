/**
 * AI Music Theory Assistant - Chat API Route
 * 
 * POST /api/ai-assistant/chat
 * Handles AI chat requests with rate limiting and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletionWithRetry } from '@/lib/ai-assistant/openai-service';
import { ChatMessage, AIContext } from '@/lib/ai-assistant/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

/**
 * Check if request is within rate limit
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(ip);

  if (!limit || now > limit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, limit] of requestCounts.entries()) {
    if (now > limit.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * POST handler for AI chat
 */
export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your API key to .env.local' },
        { status: 500 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          retryAfter: 60 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory, currentKey, currentScale, tuning, userSkillLevel, conversationId, authToken } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message: must be a non-empty string' },
        { status: 400 }
      );
    }

    // Limit message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Validate conversation history
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid conversation history: must be an array' },
        { status: 400 }
      );
    }

    // Build context
    const context: AIContext = {};
    if (currentKey && currentScale) {
      context.key = currentKey;
      context.scale = currentScale;
    }
    if (tuning && Array.isArray(tuning)) {
      context.tuning = tuning;
    }
    if (userSkillLevel && ['beginner', 'intermediate', 'advanced'].includes(userSkillLevel)) {
      context.userSkillLevel = userSkillLevel;
    }

    // Get AI response with retry logic
    const response = await getChatCompletionWithRetry(
      message,
      conversationHistory || [],
      context
    );

    // Save to database if conversationId and authToken provided
    let savedConversationId = conversationId;
    if (authToken) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user } } = await supabase.auth.getUser(authToken);

        if (user) {
          // If no conversationId, create new conversation
          if (!conversationId) {
            const { data: newConv } = await supabase
              .from('ai_conversations')
              .insert({
                user_id: user.id,
                title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                preview_text: message.substring(0, 100),
              })
              .select()
              .single();

            if (newConv) {
              savedConversationId = newConv.id;
            }
          }

          // Save user message
          if (savedConversationId) {
            await supabase.from('ai_messages').insert({
              conversation_id: savedConversationId,
              role: 'user',
              content: message,
            });

            // Save assistant response
            await supabase.from('ai_messages').insert({
              conversation_id: savedConversationId,
              role: 'assistant',
              content: response.messageText,
              tokens_used: response.usage?.totalTokens || null,
              metadata: {
                scaleRecommendations: response.scaleRecommendations || [],
                progressionSuggestions: response.progressionSuggestions || [],
              },
            });
          }
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Don't fail the request if database save fails
      }
    }

    // Return successful response with usage metadata
    return NextResponse.json({
      response,
      conversationId: savedConversationId || crypto.randomUUID(),
      timestamp: Date.now(),
      usage: response.usage, // Include token usage information
    });

  } catch (error) {
    console.error('AI Assistant API error:', error);

    // Log additional context for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: error.message, retryAfter: 60 },
          { status: 429 }
        );
      }

      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'OpenAI API configuration error. Please check your API key.' },
          { status: 500 }
        );
      }

      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'AI response format error. Please try rephrasing your question.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler - return API info
 */
export async function GET() {
  return NextResponse.json({
    name: 'AI Music Theory Assistant API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ai-assistant/chat',
    },
    rateLimit: {
      requests: RATE_LIMIT,
      window: `${RATE_LIMIT_WINDOW / 1000} seconds`,
    },
  });
}

