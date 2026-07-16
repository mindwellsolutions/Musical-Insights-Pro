'use client';

import { KeyboardEvent } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  theme: ThemeConfig;
}

export default function ChatInput({ value, onChange, onSend, isLoading, theme }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about scales, modes, progressions..."
        disabled={isLoading}
        rows={2}
        className="flex-1 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
        style={{
          background: theme.bgTertiary,
          color: theme.textPrimary,
          borderColor: theme.border,
          opacity: isLoading ? 0.6 : 1,
        }}
        maxLength={500}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="px-4 rounded-lg transition-all flex items-center justify-center"
        style={{
          background: value.trim() && !isLoading ? theme.accentPrimary : theme.bgTertiary,
          color: value.trim() && !isLoading ? '#ffffff' : theme.textSecondary,
          cursor: value.trim() && !isLoading ? 'pointer' : 'not-allowed',
          opacity: value.trim() && !isLoading ? 1 : 0.5,
        }}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}

