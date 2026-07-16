/**
 * Chat History Modal Component
 * Full-screen modal with two-panel layout for viewing conversation history
 */

'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { X } from 'lucide-react';
import ConversationSidebar from './ConversationSidebar';
import ConversationPreview from './ConversationPreview';
import type { ConversationListItem } from '@/lib/ai-assistant/chat-history-types';
import type { FretboardScaleData } from '@/lib/ai-assistant/types';

interface ChatHistoryModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onOpenConversation: (conversationId: string) => void;
  tuning: string[];
  onLoadScale: (scaleData: FretboardScaleData) => void;
}

export default function ChatHistoryModal({
  theme,
  isOpen,
  onClose,
  onOpenConversation,
  tuning,
  onLoadScale,
}: ChatHistoryModalProps) {
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full h-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: theme.bgPrimary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              background: theme.bgTertiary,
              color: theme.textPrimary,
            }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - 30% */}
          <div
            className="w-full md:w-[30%] border-r overflow-hidden"
            style={{ borderColor: theme.border }}
          >
            <ConversationSidebar
              theme={theme}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={setSelectedConversation}
            />
          </div>

          {/* Preview Panel - 70% */}
          <div className="hidden md:block md:w-[70%] overflow-hidden">
            <ConversationPreview
              theme={theme}
              conversation={selectedConversation}
              onOpenInAssistant={(id) => {
                onOpenConversation(id);
                onClose();
              }}
              tuning={tuning}
              onLoadScale={(scaleData) => {
                onLoadScale(scaleData);
                onClose();
              }}
            />
          </div>
        </div>

        {/* Mobile: Show preview in full screen when conversation selected */}
        {selectedConversation && (
          <div className="md:hidden fixed inset-0 z-50" style={{ background: theme.bgPrimary }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border }}>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-sm font-medium"
                style={{ color: theme.accentPrimary }}
              >
                ← Back
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg"
                style={{ background: theme.bgTertiary }}
              >
                <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
              </button>
            </div>
            <ConversationPreview
              theme={theme}
              conversation={selectedConversation}
              onOpenInAssistant={(id) => {
                onOpenConversation(id);
                onClose();
              }}
              tuning={tuning}
              onLoadScale={(scaleData) => {
                onLoadScale(scaleData);
                onClose();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

