'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Plus, Loader2, Info, History } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { ChatMessage, AIScaleRecommendation, FretboardScaleData, TokenUsage } from '@/lib/ai-assistant/types';
import { TargetNoteHighlight } from '@/lib/target-notes/types';
import { parseAIScaleToFretboard } from '@/lib/ai-assistant/scale-parser';
import { getSuggestedQuestions } from '@/lib/ai-assistant/prompt-builder';
import { useSharedSkillLevel } from '@/hooks/useSharedSkillLevel';
import SkillLevelSelector, { SkillLevel } from '@/components/shared/SkillLevelSelector';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import TokenUsageInfo from './TokenUsageInfo';
import ChatHistoryModal from './ChatHistoryModal';
import { createClient } from '@/lib/supabase/client-ssr';
import { useConversation } from '@/hooks/useAIConversations';

interface AIAssistantSidebarProps {
  theme: ThemeConfig;
  isExpanded: boolean;
  onToggle: () => void;
  currentKey?: string;
  currentScale?: string;
  tuning: string[];
  stringCount?: number;
  onLoadScale: (scaleData: FretboardScaleData) => void;
  onLoadChord?: (chordNotes: string[]) => void;
  onLoadTargetNotes?: (highlight: TargetNoteHighlight) => void;
  activeTargetNoteHighlight?: TargetNoteHighlight | null;
}

export default function AIAssistantSidebar({
  theme,
  isExpanded,
  onToggle,
  currentKey,
  currentScale,
  tuning,
  stringCount = 6,
  onLoadScale,
  onLoadChord,
  onLoadTargetNotes,
  activeTargetNoteHighlight,
}: AIAssistantSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedScales, setLoadedScales] = useState<Set<string>>(new Set());
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);
  const [showUsageInfo, setShowUsageInfo] = useState(false);
  const [skillLevel, setSkillLevel] = useSharedSkillLevel();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll to bottom when assistant is opened (if there are messages)
  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      // Use setTimeout to ensure DOM is ready after expansion animation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isExpanded]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // OPTIMIZATION: Only send last 4 messages to reduce payload size
      const recentHistory = messages.slice(-4);

      // Get auth token for database persistence
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || null;

      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: recentHistory,
          currentKey,
          currentScale,
          tuning,
          userSkillLevel: skillLevel,
          conversationId: currentConversationId,
          authToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Update conversation ID if new conversation was created
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Store usage information for the info button
      if (data.usage) {
        setLastUsage(data.usage);
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response.messageText,
        timestamp: Date.now(),
        scaleRecommendations: data.response.scaleRecommendations,
        chordRecommendations: data.response.chordRecommendations,
        progressionRecommendations: data.response.progressionRecommendations,
        progressionSuggestions: data.response.progressionSuggestions,
        targetNoteRecommendations: data.response.targetNoteRecommendations,
        usage: data.usage,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, currentKey, currentScale, tuning, isLoading]);

  const handleLoadScale = useCallback((scale: AIScaleRecommendation) => {
    try {
      const scaleData = parseAIScaleToFretboard(scale, tuning);
      onLoadScale(scaleData);

      const scaleKey = `${scale.rootNote}-${scale.scaleName}`;
      setLoadedScales(prev => new Set(prev).add(scaleKey));
    } catch (err) {
      console.error('Error loading scale:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scale');
    }
  }, [tuning, onLoadScale]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setLoadedScales(new Set());
    setCurrentConversationId(null);
    localStorage.removeItem('ai-chat-history');
  }, []);

  const handleOpenConversation = useCallback(async (conversationId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch(`/api/ai-assistant/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load conversation');

      const data = await response.json();

      // Convert database messages to ChatMessage format
      const loadedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        scaleRecommendations: msg.metadata?.scaleRecommendations || [],
        progressionSuggestions: msg.metadata?.progressionSuggestions || [],
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
      setLoadedScales(new Set());
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    }
  }, []);

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  return (
    <>
      {/* Floating pill toggle button */}
      <button
        onClick={onToggle}
        aria-label={isExpanded ? 'Close AI Assistant' : 'Open AI Assistant'}
        style={{
          position: 'fixed',
          bottom: 68,
          right: isExpanded ? 360 + 16 : 12,
          transition: 'right var(--mi-transition-slide)',
          zIndex: 45,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 16px',
          height: 36,
          borderRadius: 'var(--mi-radius-full)',
          background: isExpanded
            ? 'var(--mi-bg-elevated)'
            : 'linear-gradient(135deg, var(--mi-accent-violet), #7c3aed)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid var(--mi-border-medium)',
          boxShadow: 'var(--mi-shadow-elevated)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Sparkles size={14} />
        {isExpanded ? 'Close AI' : 'AI Assistant'}
        {!isExpanded && messages.length > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}>
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>

    {isExpanded && (
    <div
      className="fixed right-0 flex flex-col shadow-2xl"
      style={{
        top: 64, width: 360, height: 'calc(100vh - 64px)',
        background: 'var(--mi-bg-surface)',
        borderLeft: '1px solid var(--mi-border-medium)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: theme.accentPrimary }} />
          <h2 className="font-semibold" style={{ color: theme.textPrimary }}>
            AI Music Theory Assistant
          </h2>
          {lastUsage && (
            <button
              onClick={() => setShowUsageInfo(true)}
              className="p-1 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors"
              aria-label="View API usage info"
              title="View token usage and cost"
            >
              <Info className="w-4 h-4" style={{ color: theme.textSecondary }} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors"
            aria-label="View chat history"
            title="Chat History"
            style={{ color: theme.textPrimary }}
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
            aria-label="Close AI Assistant"
          >
            <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
          </button>
        </div>
      </div>

      {/* Skill Level Selector */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: theme.border }}
      >
        <SkillLevelSelector
          skillLevel={skillLevel}
          onSkillLevelChange={setSkillLevel}
          theme={theme}
          showLabel={true}
          showDescription={true}
          collapsible={true}
          defaultExpanded={false}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Sparkles className="w-16 h-16 mb-4" style={{ color: theme.accentPrimary }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
              Welcome to AI Music Theory Assistant
            </h3>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              Ask me about scales, modes, chords, progressions, and music theory concepts.
            </p>
            <div className="w-full">
              <p className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary }}>
                Try asking:
              </p>
              {getSuggestedQuestions().slice(0, 3).map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSuggestedQuestion(q.text)}
                  className="w-full text-left p-2 rounded mb-2 text-sm transition-colors"
                  style={{
                    background: theme.bgTertiary,
                    color: theme.textPrimary,
                  }}
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          theme={theme}
          loadedScales={loadedScales}
          onLoadScale={handleLoadScale}
          onSuggestedQuestion={handleSuggestedQuestion}
          tuning={tuning}
          stringCount={stringCount}
          activeTargetNoteHighlight={activeTargetNoteHighlight}
          onLoadTargetNotes={onLoadTargetNotes}
        />

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: theme.bgTertiary }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.accentPrimary }} />
            <span className="text-sm" style={{ color: theme.textSecondary }}>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm mt-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="border-t p-4"
        style={{ borderColor: theme.border }}
      >
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
          theme={theme}
        />
        <QuickActions
          onClearChat={handleNewConversation}
          onSuggestedQuestion={handleSuggestedQuestion}
          theme={theme}
          hasMessages={messages.length > 0}
        />
      </div>

      {/* Token Usage Info Modal */}
      {showUsageInfo && lastUsage && (
        <TokenUsageInfo
          usage={lastUsage}
          theme={theme}
          onClose={() => setShowUsageInfo(false)}
        />
      )}

      {/* Chat History Modal */}
      <ChatHistoryModal
        theme={theme}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onOpenConversation={handleOpenConversation}
        tuning={tuning}
        onLoadScale={(scaleData) => onLoadScale(scaleData)}
      />
    </div>
    )}
    </>
  );
}

