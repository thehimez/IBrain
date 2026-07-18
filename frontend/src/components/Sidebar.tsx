import { Plus, BookOpen, Network, LayoutDashboard, Settings, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConversationItem from './ConversationItem';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: BookOpen, label: 'Documents', placeholder: true },
  { icon: Network, label: 'Knowledge Graph', placeholder: true },
  { icon: LayoutDashboard, label: 'Dashboard', placeholder: true },
  { icon: Settings, label: 'Settings', placeholder: true },
];

export default function Sidebar({ open, onClose }: Props) {
  const {
    conversations, currentConversation,
    createConversation, selectConversation,
    deleteConversation, renameConversation,
    brainStatus,
  } = useApp();

  const handleNew = () => {
    createConversation();
    onClose();
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-navy-800 border-r border-navy-600 z-30 flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-navy-600 flex-shrink-0">
          <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Navigation</span>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-navy-700 text-slate-500 hover:text-white transition-colors lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 border-b border-navy-600 flex-shrink-0">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent-light font-medium text-sm transition-all glow-blue-sm group"
          >
            <Plus size={16} className="transition-transform group-hover:rotate-90" />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>No conversations yet.</p>
              <p className="mt-1">Start a new chat above.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wider px-2 pb-1">Recent</p>
              {conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={currentConversation?.id === conv.id}
                  onSelect={() => { selectConversation(conv.id); onClose(); }}
                  onDelete={() => deleteConversation(conv.id)}
                  onRename={title => renameConversation(conv.id, title)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nav items (placeholders) */}
        <div className="border-t border-navy-600 p-2 flex-shrink-0">
          <p className="text-xs text-slate-600 font-medium uppercase tracking-wider px-2 pb-2">Modules</p>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-navy-700/60 text-slate-500 text-xs font-medium transition-colors group"
                title="Coming soon"
              >
                <Icon size={14} />
                <span className="flex-1 text-left">{label}</span>
                <ChevronRight size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Brain info footer */}
        <div className="border-t border-navy-600 p-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${brainStatus?.connected ? 'bg-success animate-pulse-slow' : 'bg-slate-600'}`} />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{brainStatus?.pageCount ?? 0} pages indexed</p>
              <p className="text-xs text-slate-600 truncate">v{brainStatus?.version ?? '—'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
