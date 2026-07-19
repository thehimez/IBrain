import { useState, useCallback, useEffect, useRef } from 'react';
import { chatService } from '../services/chat';
import { saveConversations, loadConversations } from '../utils/storage';
import { generateId, titleFromMessage } from '../utils/format';
import type { Conversation, Message } from '../types';

export function useChat(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoaded = useRef(false);

  // Load persisted conversations on mount / user change
  useEffect(() => {
    if (!userId) { setConversations([]); setCurrentId(null); isLoaded.current = false; return; }
    loadConversations(userId).then(saved => {
      setConversations(saved);
      if (saved.length > 0) setCurrentId(saved[0]!.id);
      isLoaded.current = true;
    });
  }, [userId]);

  // Persist on every change
  useEffect(() => {
    if (!userId || !isLoaded.current) return;
    saveConversations(userId, conversations);
  }, [conversations, userId]);

  const currentConversation = conversations.find(c => c.id === currentId) ?? null;

  const createConversation = useCallback((): Conversation => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations(prev => [conv, ...prev]);
    setCurrentId(conv.id);
    return conv;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      if (currentId === id) setCurrentId(next[0]?.id ?? null);
      return next;
    });
  }, [currentId]);

  const selectConversation = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    setError(null);
    let conv = conversations.find(c => c.id === currentId);
    if (!conv) {
      conv = {
        id: generateId(),
        title: titleFromMessage(text),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setConversations(prev => [conv!, ...prev]);
      setCurrentId(conv.id);
    }

    const convId = conv.id;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const appendMessages = (msgs: Message[]) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, ...msgs], updatedAt: new Date().toISOString() }
            : c,
        ),
      );
    };

    appendMessages([userMsg, assistantMsg]);
    setIsSending(true);

    try {
      const history = [...(conv.messages ?? []), userMsg]
        .filter(m => !m.isStreaming)
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await chatService.send({ message: text, conversationHistory: history });

      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? {
                ...c,
                title: c.messages.length <= 2 ? titleFromMessage(text) : c.title,
                updatedAt: new Date().toISOString(),
                messages: c.messages.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: response.answer,
                        citations: response.citations,
                        gaps: response.gaps,
                        isStreaming: false,
                      }
                    : m,
                ),
              }
            : c,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setError(msg);
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantId
                    ? { ...m, content: '⚠ ' + msg, isStreaming: false }
                    : m,
                ),
              }
            : c,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }, [conversations, currentId]);

  return {
    conversations,
    currentConversation,
    currentId,
    isSending,
    error,
    createConversation,
    deleteConversation,
    selectConversation,
    sendMessage,
  };
}
