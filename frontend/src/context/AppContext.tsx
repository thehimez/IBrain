import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Conversation, Message, BrainStatus, AppUser } from '../types';
import { brainService } from '../services/brain';
import { useAuth } from './AuthContext';

interface AppContextValue {
  // User
  currentUser: AppUser;
  // Brain
  currentBrain: string;
  brainStatus: BrainStatus | null;
  // Conversations
  conversations: Conversation[];
  currentConversation: Conversation | null;
  // Actions
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  getCurrentBrain: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const storageKey = (userId: string) => `gbrain_conversations_${userId}`;

function loadConversations(userId: string): Conversation[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

function saveConversations(userId: string, convs: Conversation[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(convs));
  } catch { /* storage full */ }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const currentUser: AppUser = authUser
    ? { id: authUser.id, name: authUser.name, avatar: authUser.avatarUrl ?? undefined }
    : { id: 'demo', name: 'Demo User' };
  const currentBrainName = 'Industrial Knowledge Brain';

  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations(currentUser.id));
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    () => loadConversations(currentUser.id)[0]?.id ?? null
  );
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null);

  // Re-load conversations when user changes (e.g. after login)
  useEffect(() => {
    const convs = loadConversations(currentUser.id);
    setConversations(convs);
    setCurrentConversationId(convs[0]?.id ?? null);
  }, [currentUser.id]);

  // Persist on change (scoped to user)
  useEffect(() => { saveConversations(currentUser.id, conversations); }, [currentUser.id, conversations]);

  // Poll brain status
  useEffect(() => {
    const poll = async () => {
      try {
        const status = await brainService.getStatus();
        setBrainStatus(status);
      } catch {
        setBrainStatus({ connected: false, name: currentBrainName, pageCount: 0, engine: 'unknown', version: 'unknown' });
      }
    };
    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, []);

  const createConversation = useCallback((): Conversation => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };
    setConversations(prev => [conv, ...prev]);
    setCurrentConversationId(conv.id);
    return conv;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setCurrentConversationId(prev => {
      if (prev !== id) return prev;
      const remaining = conversations.filter(c => c.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [conversations]);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title, updatedAt: new Date() } : c));
  }, []);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const isFirst = c.messages.length === 0 && message.role === 'user';
      return {
        ...c,
        title: isFirst ? message.content.slice(0, 60) : c.title,
        updatedAt: new Date(),
        messages: [...c.messages, message],
      };
    }));
  }, []);

  const updateMessage = useCallback((conversationId: string, messageId: string, patch: Partial<Message>) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        updatedAt: new Date(),
        messages: c.messages.map(m => m.id === messageId ? { ...m, ...patch } : m),
      };
    }));
  }, []);

  const getCurrentBrain = useCallback(() => currentBrainName, []);

  const currentConversation = conversations.find(c => c.id === currentConversationId) ?? null;

  return (
    <AppContext.Provider value={{
      currentUser,
      currentBrain: currentBrainName,
      brainStatus,
      conversations,
      currentConversation,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      addMessage,
      updateMessage,
      getCurrentBrain,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
