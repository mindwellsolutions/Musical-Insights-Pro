'use client';

import { ChatMessage, AIScaleRecommendation } from '@/lib/ai-assistant/types';
import { TargetNoteHighlight } from '@/lib/target-notes/types';
import { ThemeConfig } from '@/lib/themes';
import { User, Sparkles } from 'lucide-react';
import UnifiedRecommendationDisplay from './UnifiedRecommendationDisplay';

interface MessageListProps {
  messages: ChatMessage[];
  theme: ThemeConfig;
  loadedScales: Set<string>;
  onLoadScale: (scale: AIScaleRecommendation) => void;
  onSuggestedQuestion: (question: string) => void;
  tuning: string[];
  stringCount: number;
  activeTargetNoteHighlight?: TargetNoteHighlight | null;
  onLoadTargetNotes?: (highlight: TargetNoteHighlight) => void;
}

export default function MessageList({
  messages,
  theme,
  loadedScales,
  onLoadScale,
  onSuggestedQuestion,
  tuning,
  stringCount,
  activeTargetNoteHighlight,
  onLoadTargetNotes,
}: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
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

            {/* Unified Recommendations Display */}
            {message.role === 'assistant' && (
              (message.scaleRecommendations && message.scaleRecommendations.length > 0) ||
              (message.chordRecommendations && message.chordRecommendations.length > 0) ||
              (message.progressionRecommendations && message.progressionRecommendations.length > 0) ||
              (message.targetNoteRecommendations && message.targetNoteRecommendations.length > 0)
            ) && (
              <div className="mt-3">
                <UnifiedRecommendationDisplay
                  scaleRecommendations={message.scaleRecommendations}
                  chordRecommendations={message.chordRecommendations}
                  progressionRecommendations={message.progressionRecommendations}
                  targetNoteRecommendations={message.targetNoteRecommendations}
                  activeTargetNoteHighlight={activeTargetNoteHighlight}
                  onLoadTargetNotes={onLoadTargetNotes}
                  theme={theme}
                  loadedScales={loadedScales}
                  onLoadScale={onLoadScale}
                  tuning={tuning}
                  stringCount={stringCount}
                />
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {new Date(message.timestamp).toLocaleTimeString()}
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
  );
}

