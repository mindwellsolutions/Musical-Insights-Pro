'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { getSuggestedQuestions } from '@/lib/ai-assistant/prompt-builder';
import { Plus, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface QuickActionsProps {
  onClearChat: () => void;
  onSuggestedQuestion: (question: string) => void;
  theme: ThemeConfig;
  hasMessages: boolean;
}

export default function QuickActions({
  onClearChat,
  onSuggestedQuestion,
  theme,
  hasMessages,
}: QuickActionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestedQuestions = getSuggestedQuestions();

  return (
    <div className="mt-2">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
          }}
        >
          <Lightbulb className="w-3 h-3" />
          Suggestions
          {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={onClearChat}
          className="py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-2 hover:scale-105"
          style={{
            background: theme.accentPrimary,
            color: '#ffffff',
          }}
          title="Start a new conversation"
        >
          <Plus className="w-3 h-3" />
          New
        </button>
      </div>

      {/* Suggested Questions */}
      {showSuggestions && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {suggestedQuestions.map((question) => (
            <button
              key={question.id}
              onClick={() => {
                onSuggestedQuestion(question.text);
                setShowSuggestions(false);
              }}
              className="w-full text-left p-2 rounded text-xs transition-all hover:opacity-80"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
              }}
            >
              {question.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

