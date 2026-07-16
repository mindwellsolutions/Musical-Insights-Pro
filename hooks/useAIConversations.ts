/**
 * React Query hooks for AI Assistant Chat History
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client-ssr';
import type {
  ConversationsResponse,
  ConversationWithMessages,
  ConversationFilters,
  PaginationParams,
  CreateConversationRequest,
  UpdateConversationRequest,
  AddMessageRequest,
} from '@/lib/ai-assistant/chat-history-types';

/**
 * Get auth token for API requests
 */
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Hook to fetch conversations list
 */
export function useConversations(filters?: ConversationFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: ['ai-conversations', filters, pagination],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.is_archived !== undefined) params.append('is_archived', String(filters.is_archived));
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.order) params.append('order', filters.order);
      if (pagination?.limit) params.append('limit', String(pagination.limit));
      if (pagination?.offset) params.append('offset', String(pagination.offset));

      const response = await fetch(`/api/ai-assistant/conversations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json() as Promise<ConversationsResponse>;
    },
    enabled: true,
  });
}

/**
 * Hook to fetch single conversation with messages
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/ai-assistant/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch conversation');
      return response.json() as Promise<ConversationWithMessages>;
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook to create new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationRequest) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
}

/**
 * Hook to update conversation
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateConversationRequest }) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update conversation');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', variables.id] });
    },
  });
}

/**
 * Hook to delete conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete conversation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });
}

