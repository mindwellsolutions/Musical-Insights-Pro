/**
 * TypeScript types for AI Assistant Chat History System
 */

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count: number;
  preview_text: string | null;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens_used: number | null;
  metadata: Record<string, any>;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationListItem {
  id: string;
  title: string;
  preview_text: string | null;
  message_count: number;
  updated_at: string;
  created_at: string;
  is_archived: boolean;
}

export interface ConversationFilters {
  search?: string;
  is_archived?: boolean;
  sort?: 'updated_at' | 'created_at' | 'title';
  order?: 'asc' | 'desc';
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ConversationsResponse {
  conversations: ConversationListItem[];
  total: number;
  hasMore: boolean;
}

export interface CreateConversationRequest {
  title?: string;
  firstMessage?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  is_archived?: boolean;
}

export interface AddMessageRequest {
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  metadata?: Record<string, any>;
}

