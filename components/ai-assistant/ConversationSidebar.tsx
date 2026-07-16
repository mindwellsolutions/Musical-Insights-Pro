/**
 * Conversation Sidebar Component
 * Shows list of conversations with search and filter
 */

'use client';

import { useState, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useConversations, useCreateConversation } from '@/hooks/useAIConversations';
import ConversationListItem from './ConversationListItem';
import type { ConversationListItem as ConversationItem } from '@/lib/ai-assistant/chat-history-types';

interface ConversationSidebarProps {
  theme: ThemeConfig;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationItem) => void;
}

export default function ConversationSidebar({
  theme,
  selectedConversationId,
  onSelectConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');

  const { data, isLoading, error } = useConversations(
    {
      search: searchQuery || undefined,
      is_archived: filterTab === 'archived' ? true : filterTab === 'active' ? false : undefined,
      sort: sortBy,
      order: 'desc',
    },
    { limit: 50, offset: 0 }
  );

  const createConversation = useCreateConversation();

  const handleNewConversation = async () => {
    try {
      const result = await createConversation.mutateAsync({ title: 'New Conversation' });
      if (result.conversation) {
        onSelectConversation(result.conversation);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b" style={{ borderColor: theme.border }}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: theme.textSecondary }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              background: theme.bgTertiary,
              color: theme.textPrimary,
              borderColor: theme.border,
            }}
          />
        </div>
      </div>

      {/* Filter Tabs & Sort */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
        <div className="flex gap-2">
          {(['all', 'active', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterTab === tab ? theme.accentPrimary : theme.bgTertiary,
                color: filterTab === tab ? '#ffffff' : theme.textSecondary,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-xs px-2 py-1 rounded"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          <option value="updated_at">Recent</option>
          <option value="created_at">Oldest</option>
          <option value="title">A-Z</option>
        </select>
      </div>

      {/* New Conversation Button */}
      <div className="p-4 border-b" style={{ borderColor: theme.border }}>
        <button
          onClick={handleNewConversation}
          disabled={createConversation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
          style={{
            background: theme.accentPrimary,
            color: '#ffffff',
            opacity: createConversation.isPending ? 0.6 : 1,
          }}
        >
          {createConversation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Conversation
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accentPrimary }} />
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-sm" style={{ color: theme.accentSecondary }}>
            Failed to load conversations
          </div>
        )}

        {data && data.conversations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              No conversations yet. Start a new one!
            </p>
          </div>
        )}

        {data?.conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            theme={theme}
            isSelected={conversation.id === selectedConversationId}
            onSelect={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  );
}

