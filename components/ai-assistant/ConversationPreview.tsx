/**
 * Conversation Preview Component
 * Shows full conversation messages in the preview panel
 */

'use client';

import { ThemeConfig } from '@/lib/themes';
import { Loader2, ExternalLink, Archive, Trash2, User, Sparkles } from 'lucide-react';
import { useConversation, useUpdateConversation, useDeleteConversation } from '@/hooks/useAIConversations';
import type { ConversationListItem } from '@/lib/ai-assistant/chat-history-types';
import UnifiedRecommendationDisplay from './UnifiedRecommendationDisplay';
import type { AIScaleRecommendation, AIChordRecommendation, AIChordProgressionRecommendation, FretboardScaleData } from '@/lib/ai-assistant/types';
import { parseAIScaleToFretboard } from '@/lib/ai-assistant/scale-parser';
import { useState, useCallback } from 'react';

interface ConversationPreviewProps {
  theme: ThemeConfig;
  conversation: ConversationListItem | null;
  onOpenInAssistant: (conversationId: string) => void;
  tuning: string[];
  onLoadScale: (scaleData: FretboardScaleData) => void;
}

export default function ConversationPreview({
  theme,
  conversation,
  onOpenInAssistant,
  tuning,
  onLoadScale,
}: ConversationPreviewProps) {
  const { data, isLoading, error } = useConversation(conversation?.id || null);
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();
  const [loadedScales, setLoadedScales] = useState<Set<string>>(new Set());

  const handleLoadScale = useCallback((scale: AIScaleRecommendation) => {
    try {
      const scaleData = parseAIScaleToFretboard(scale, tuning);
      onLoadScale(scaleData);

      const scaleKey = `${scale.rootNote}-${scale.scaleName}`;
      setLoadedScales(prev => new Set(prev).add(scaleKey));
    } catch (err) {
      console.error('Error loading scale:', err);
    }
  }, [tuning, onLoadScale]);

  const handleArchive = async () => {
    if (!conversation) return;
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: { is_archived: !conversation.is_archived },
      });
    } catch (err) {
      console.error('Failed to archive conversation:', err);
    }
  };

  const handleDelete = async () => {
    if (!conversation) return;
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation.mutateAsync(conversation.id);
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Select a conversation to view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
              {conversation.title}
            </h3>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {conversation.message_count} messages • {new Date(conversation.created_at).toLocaleDateString()}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onOpenInAssistant(conversation.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
              style={{
                background: theme.accentPrimary,
                color: '#ffffff',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Open in Assistant
            </button>
            <button
              onClick={handleArchive}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
              }}
              title={conversation.is_archived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: theme.bgTertiary,
                color: theme.accentSecondary,
              }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accentPrimary }} />
          </div>
        )}

        {error && (
          <div className="text-center py-8" style={{ color: theme.accentSecondary }}>
            Failed to load messages
          </div>
        )}

        {data && data.messages.length === 0 && (
          <div className="text-center py-8" style={{ color: theme.textSecondary }}>
            No messages in this conversation
          </div>
        )}

        {data && data.messages.length > 0 && (
          <div className="space-y-4">
            {data.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`flex-1 ${message.role === 'user' ? 'max-w-[80%]' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${message.role === 'user' ? 'ml-auto' : ''}`}
                    style={{
                      background: message.role === 'user' ? theme.accentPrimary : theme.bgTertiary,
                      color: message.role === 'user' ? '#ffffff' : theme.textPrimary,
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Display recommendation cards for assistant messages */}
                  {message.role === 'assistant' && message.metadata && (
                    (message.metadata.scaleRecommendations?.length > 0 ||
                     message.metadata.chordRecommendations?.length > 0 ||
                     message.metadata.progressionRecommendations?.length > 0)
                  ) && (
                    <div className="mt-3">
                      <UnifiedRecommendationDisplay
                        scaleRecommendations={message.metadata.scaleRecommendations as AIScaleRecommendation[] || []}
                        chordRecommendations={message.metadata.chordRecommendations as AIChordRecommendation[] || []}
                        progressionRecommendations={message.metadata.progressionRecommendations as AIChordProgressionRecommendation[] || []}
                        theme={theme}
                        loadedScales={loadedScales}
                        onLoadScale={handleLoadScale}
                        tuning={tuning}
                        stringCount={tuning.length}
                      />
                    </div>
                  )}

                  <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: theme.bgTertiary }}
                  >
                    <User className="w-4 h-4" style={{ color: theme.textPrimary }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

