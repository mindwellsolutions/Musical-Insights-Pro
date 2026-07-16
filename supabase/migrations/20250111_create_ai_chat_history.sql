-- =====================================================
-- AI Assistant Chat History System
-- Migration: Create tables, RLS policies, indexes, and functions
-- =====================================================

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    message_count INTEGER NOT NULL DEFAULT 0,
    preview_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- ai_conversations policies
CREATE POLICY "Users can view their own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to conversations"
    ON public.ai_conversations FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ai_messages policies
CREATE POLICY "Users can view messages from their conversations"
    ON public.ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE id = ai_messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE id = ai_messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations"
    ON public.ai_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE id = ai_messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access to messages"
    ON public.ai_messages FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Trigger Functions
-- =====================================================

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment message count
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET message_count = message_count + 1
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement message count
CREATE OR REPLACE FUNCTION decrement_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET message_count = GREATEST(0, message_count - 1)
    WHERE id = OLD.conversation_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to update preview text
CREATE OR REPLACE FUNCTION update_preview_text()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update preview if this is the first user message
    IF NEW.role = 'user' THEN
        UPDATE public.ai_conversations
        SET preview_text = LEFT(NEW.content, 100)
        WHERE id = NEW.conversation_id
        AND preview_text IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

CREATE TRIGGER trigger_increment_message_count
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_message_count();

CREATE TRIGGER trigger_decrement_message_count
    AFTER DELETE ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION decrement_message_count();

CREATE TRIGGER trigger_update_preview_text
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_preview_text();

