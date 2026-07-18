import { useRef, useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function MessageInput({ onSend, disabled, loading }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || loading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-navy-600 bg-navy-800/60 backdrop-blur-sm p-4">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-end gap-3 bg-navy-700/80 border rounded-2xl px-4 py-3 transition-colors ${
          disabled ? 'border-navy-600 opacity-60' : 'border-navy-500 focus-within:border-accent/40 focus-within:glow-blue'
        }`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            placeholder="Ask anything about your knowledge base…"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none outline-none text-sm leading-relaxed max-h-40 overflow-y-auto"
          />
          <button
            onClick={submit}
            disabled={!value.trim() || disabled || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              value.trim() && !disabled && !loading
                ? 'bg-accent hover:bg-accent-dim text-white glow-blue-sm'
                : 'bg-navy-600 text-slate-600 cursor-not-allowed'
            }`}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={15} />
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          Shift+Enter for newline · Enter to send
        </p>
      </div>
    </div>
  );
}
