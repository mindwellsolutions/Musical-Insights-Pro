/**
 * Conversation Context for AI Assistant
 * Manages current active conversation state
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Conversation, Message } from '@/lib/ai-assistant/chat-history-types';

interface ConversationContextType {
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  messages: Message[];
  setCurrentConversation: (conversation: Conversation | null, messages?: Message[]) => void;
  addMessage: (message: Message) => void;
  clearConversation: () => void;
  startNewConversation: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversationState] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const setCurrentConversation = useCallback((conversation: Conversation | null, msgs?: Message[]) => {
    setCurrentConversationState(conversation);
    setCurrentConversationId(conversation?.id || null);
    setMessages(msgs || []);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearConversation = useCallback(() => {
    setCurrentConversationState(null);
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  const startNewConversation = useCallback(() => {
    setCurrentConversationState(null);
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        currentConversation,
        messages,
        setCurrentConversation,
        addMessage,
        clearConversation,
        startNewConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within ConversationProvider');
  }
  return context;
}

