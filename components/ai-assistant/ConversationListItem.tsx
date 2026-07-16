/**
 * Conversation List Item Component
 * Individual conversation card in the sidebar
 */

'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { MessageSquare, MoreVertical, Archive, Trash2, Edit2 } from 'lucide-react';
import { useUpdateConversation, useDeleteConversation } from '@/hooks/useAIConversations';
import type { ConversationListItem as ConversationItem } from '@/lib/ai-assistant/chat-history-types';

interface ConversationListItemProps {
  conversation: ConversationItem;
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ConversationListItem({
  conversation,
  theme,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: { is_archived: !conversation.is_archived },
      });
      setShowActions(false);
    } catch (err) {
      console.error('Failed to archive conversation:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation.mutateAsync(conversation.id);
        setShowActions(false);
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      try {
        await updateConversation.mutateAsync({
          id: conversation.id,
          data: { title: editTitle.trim() },
        });
      } catch (err) {
        console.error('Failed to rename conversation:', err);
      }
    }
    setIsEditing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onSelect}
      className="relative px-4 py-3 border-b cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        background: isSelected ? theme.bgTertiary : 'transparent',
        borderColor: theme.border,
        borderLeft: isSelected ? `4px solid ${theme.accentPrimary}` : '4px solid transparent',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditTitle(conversation.title);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="w-full px-2 py-1 text-sm font-semibold rounded"
              style={{
                background: theme.bgSecondary,
                color: theme.textPrimary,
                border: `1px solid ${theme.accentPrimary}`,
              }}
            />
          ) : (
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: theme.textPrimary }}
            >
              {conversation.title}
            </h3>
          )}
          
          {conversation.preview_text && (
            <p
              className="text-xs mt-1 line-clamp-2"
              style={{ color: theme.textSecondary }}
            >
              {conversation.preview_text}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs flex items-center gap-1" style={{ color: theme.textSecondary }}>
              <MessageSquare className="w-3 h-3" />
              {conversation.message_count}
            </span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              {formatTimestamp(conversation.updated_at)}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-white"
            style={{ color: theme.textSecondary }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <div
              className="absolute right-0 top-8 w-40 rounded-lg shadow-lg z-10 overflow-hidden"
              style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-opacity-10 hover:bg-white"
                style={{ color: theme.textPrimary }}
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={handleArchive}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-opacity-10 hover:bg-white"
                style={{ color: theme.textPrimary }}
              >
                <Archive className="w-4 h-4" />
                {conversation.is_archived ? 'Unarchive' : 'Archive'}
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500 hover:bg-opacity-10"
                style={{ color: theme.accentSecondary }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

