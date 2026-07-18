import { useEffect, useRef, useState } from 'react';
import { Brain, Zap, Search, Network } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chat';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import UploadModal from './UploadModal';
import type { Message } from '../types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SUGGESTIONS = [
  { icon: Search, text: 'What are the key safety procedures for equipment maintenance?' },
  { icon: Zap, text: 'Summarize all inspection reports from last quarter' },
  { icon: Network, text: 'Show relationships between project documents and teams' },
  { icon: Brain, text: 'What knowledge gaps exist in our engineering records?' },
];

export default function ChatWindow() {
  const { currentConversation, createConversation, addMessage, updateMessage } = useApp();
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversation = currentConversation;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async (text: string) => {
    let conv = conversation;
    if (!conv) {
      conv = createConversation();
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addMessage(conv.id, userMsg);

    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessage(conv.id, assistantMsg);
    setLoading(true);

    try {
      const history = (conv.messages ?? [])
        .filter(m => !m.isStreaming)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await chatService.send({
        message: text,
        conversationHistory: history,
      });

      // Simulate streaming effect
      const full = response.answer || 'I searched the knowledge base but found no relevant information yet. Try importing some documents first.';
      let displayed = '';
      const chunkSize = 8;
      for (let i = 0; i < full.length; i += chunkSize) {
        displayed = full.slice(0, i + chunkSize);
        updateMessage(conv.id, assistantId, { content: displayed, isStreaming: true });
        await new Promise(r => setTimeout(r, 18));
      }

      updateMessage(conv.id, assistantId, {
        content: full,
        isStreaming: false,
        citations: response.citations ?? [],
        gaps: response.gaps ?? [],
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      updateMessage(conv.id, assistantId, {
        content: `**Error connecting to GBrain:** ${errMsg}\n\nMake sure the GBrain API server is running on port 3001.`,
        isStreaming: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const messages = conversation?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 bg-grid">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-6 glow-blue">
              <Brain size={32} className="text-accent-light" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to GBrain</h1>
            <p className="text-slate-400 text-base mb-10">Your Industrial Knowledge Intelligence Platform</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSend(text)}
                  disabled={loading}
                  className="flex items-start gap-3 p-4 rounded-xl bg-navy-700/60 border border-navy-600 hover:border-accent/30 hover:bg-navy-700 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-600 border border-navy-500 flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 group-hover:bg-accent/10 transition-colors">
                    <Icon size={15} className="text-slate-400 group-hover:text-accent-light transition-colors" />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 leading-relaxed transition-colors">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} onUpload={() => setUploadOpen(true)} loading={loading} disabled={false} />

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(count) => {
          setUploadedCount(prev => prev + count);
          setUploadOpen(false);
        }}
      />
    </div>
  );
}
