import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react';
import type { Conversation } from '../types';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}

export default function ConversationItem({ conversation, isActive, onSelect, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(conversation.title);
    setEditing(false);
  };

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-accent-light/10 border border-accent-light/25'
          : 'hover:bg-navy-700 border border-transparent'
      }`}
      onClick={() => !editing && onSelect()}
    >
      <MessageSquare size={14} className={`flex-shrink-0 ${isActive ? 'text-accent-light' : 'text-slate-400'}`} />

      {editing ? (
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            className="flex-1 bg-navy-700 text-slate-900 text-xs rounded px-2 py-0.5 outline-none border border-accent-light/40 min-w-0"
            onClick={e => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); commit(); }} className="text-success hover:text-slate-900 transition-colors flex-shrink-0">
            <Check size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); cancel(); }} className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-xs truncate ${isActive ? 'text-accent-dim font-medium' : 'text-slate-600'}`}>
            {conversation.title}
          </span>
          <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setEditing(true); setDraft(conversation.title); }}
              className="p-1 rounded hover:bg-navy-600 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded hover:bg-danger/10 text-slate-400 hover:text-danger transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
