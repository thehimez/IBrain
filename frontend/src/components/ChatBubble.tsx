import { useState } from 'react';
import { Brain, User, Copy, Check, AlertCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingIndicator from './LoadingIndicator';

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 animate-slide-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? 'bg-accent/20 border border-accent/30'
          : 'bg-navy-600 border border-navy-500'
      }`}>
        {isUser
          ? <User size={15} className="text-accent-light" />
          : <Brain size={15} className="text-slate-300" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 text-xs text-slate-500 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium">{isUser ? 'You' : 'GBrain'}</span>
          <span>{format(message.timestamp, 'h:mm a')}</span>
        </div>

        {/* Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-accent/20 border border-accent/25 rounded-tr-sm text-white'
            : 'bg-navy-700/80 border border-navy-600 rounded-tl-sm'
        }`}>
          {message.isStreaming && !message.content ? (
            <LoadingIndicator />
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} streaming={message.isStreaming} />
          )}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-1.5 px-1">
            <BookOpen size={11} className="text-slate-600 mt-0.5 flex-shrink-0" />
            {message.citations.map((c, i) => (
              <span
                key={i}
                className="text-xs bg-navy-700 border border-navy-600 text-slate-400 px-2 py-0.5 rounded-full font-mono"
                title={c.page_slug}
              >
                [{c.citation_index}] {c.page_slug.split('/').pop()}
              </span>
            ))}
          </div>
        )}

        {/* Gaps */}
        {!isUser && message.gaps && message.gaps.length > 0 && !message.isStreaming && (
          <div className="bg-warning/5 border border-warning/20 rounded-lg px-3 py-2 max-w-full">
            <div className="flex items-center gap-1.5 text-warning text-xs font-semibold mb-1">
              <AlertCircle size={12} />
              Knowledge Gaps
            </div>
            <ul className="space-y-0.5">
              {message.gaps.map((g, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span className="text-warning/60 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Copy button (assistant only) */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={copy}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors px-1"
          >
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        )}
      </div>
    </div>
  );
}
