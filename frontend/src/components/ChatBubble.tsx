import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingIndicator from './LoadingIndicator';
import SourceChips from './SourceChips';

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
      {/* Avatar dot */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold ${
          isUser
            ? 'bg-slate-900 text-white'
            : 'bg-accent-light/15 border border-accent-light/30 text-accent-light'
        }`}
      >
        {isUser ? '●' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 text-xs text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-slate-600">{isUser ? 'You' : 'XandaCross'}</span>
          <span>{format(message.timestamp, 'h:mm a')}</span>
        </div>

        {/* Content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-slate-900 rounded-tr-sm text-white'
              : 'bg-navy-800 border border-navy-600 rounded-tl-sm'
          }`}
          style={!isUser ? { boxShadow: '0 1px 4px rgba(0,0,0,0.05)' } : undefined}
        >
          {message.isStreaming && !message.content ? (
            <LoadingIndicator />
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} streaming={message.isStreaming} />
          )}
        </div>

        {/* Source chips */}
        {!isUser && message.citations && message.citations.length > 0 && !message.isStreaming && (
          <SourceChips citations={message.citations} />
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
                <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                  <span className="text-warning/60 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Copy */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={copy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors px-1"
          >
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        )}
      </div>
    </div>
  );
}
