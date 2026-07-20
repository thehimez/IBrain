import { useRef, useState, useEffect } from 'react';
import { Send, Loader2, Paperclip } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  onUpload?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function MessageInput({ onSend, onUpload, disabled, loading }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const canSend = !!value.trim() && !disabled && !loading;

  return (
    <div className="border-t border-navy-600 bg-navy-800 p-4">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-end gap-3 bg-navy-950 border rounded-2xl px-4 py-3 transition-colors ${
          disabled ? 'border-navy-600 opacity-60' : `border-navy-600 focus-within:border-accent-light/50`
        }`}>
          {/* Upload */}
          <button
            type="button"
            onClick={onUpload}
            disabled={disabled || loading}
            title="Upload documents"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all text-slate-400 hover:text-accent-light hover:bg-accent-light/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Paperclip size={16} />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            placeholder="Ask anything about your knowledge base…"
            rows={1}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 resize-none outline-none text-sm leading-relaxed max-h-40 overflow-y-auto"
          />

          {/* Send */}
          <button
            onClick={submit}
            disabled={!canSend}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              canSend
                ? 'bg-accent hover:bg-accent/90 text-white shadow-md'
                : 'bg-navy-700 text-slate-400 cursor-not-allowed'
            }`}
            style={canSend ? { boxShadow: '0 4px 12px rgba(239,85,32,0.35)' } : undefined}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={15} />
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          Shift+Enter for newline · Enter to send
        </p>
      </div>
    </div>
  );
}
