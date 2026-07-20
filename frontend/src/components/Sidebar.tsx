import { Plus, BookOpen, Network, LayoutDashboard, Settings, X, ChevronRight, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ConversationItem from './ConversationItem';

type Page = 'chat' | 'documents' | 'graph';

interface Props {
  open: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS = [
  { icon: BookOpen,        label: 'Documents',       page: 'documents' as Page, active: true  },
  { icon: Network,         label: 'Knowledge Graph',  page: 'graph' as Page,    active: true  },
  { icon: LayoutDashboard, label: 'Dashboard',        page: null,               active: false },
  { icon: Settings,        label: 'Settings',         page: null,               active: false },
];

export default function Sidebar({ open, onClose, currentPage, onNavigate }: Props) {
  const {
    conversations, currentConversation,
    createConversation, selectConversation,
    deleteConversation, renameConversation,
    brainStatus,
  } = useApp();
  const { logout } = useAuth();

  const handleNew = () => {
    createConversation();
    onNavigate('chat');
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    onNavigate('chat');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-navy-800 border-r border-navy-600 z-30 flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-navy-600 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-navy-700 text-slate-400 hover:text-slate-700 transition-colors lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 border-b border-navy-600 flex-shrink-0">
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/25 text-accent font-medium text-sm transition-all group"
          >
            <Plus size={16} className="transition-transform group-hover:rotate-90" />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No conversations yet.</p>
              <p className="mt-1">Start a new chat above.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider px-2 pb-1">Recent</p>
              {conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={currentPage === 'chat' && currentConversation?.id === conv.id}
                  onSelect={() => handleSelectConversation(conv.id)}
                  onDelete={() => deleteConversation(conv.id)}
                  onRename={title => renameConversation(conv.id, title)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className="border-t border-navy-600 p-2 flex-shrink-0">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider px-2 pb-2">Modules</p>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ icon: Icon, label, page, active }) => {
              const isCurrentPage = page && currentPage === page;
              return (
                <button
                  key={label}
                  onClick={() => active && page ? onNavigate(page) : undefined}
                  title={active ? undefined : 'Coming soon'}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors group ${
                    isCurrentPage
                      ? 'bg-accent-light/10 border border-accent-light/25 text-accent-light'
                      : active
                        ? 'hover:bg-navy-700 text-slate-500 hover:text-slate-800 cursor-pointer'
                        : 'text-slate-400 cursor-default opacity-50'
                  }`}
                >
                  <Icon size={14} />
                  <span className="flex-1 text-left">{label}</span>
                  {active && !isCurrentPage && (
                    <ChevronRight size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                  {isCurrentPage && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                  )}
                  {!active && (
                    <span className="text-xs text-slate-400 font-normal">Soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-navy-600 p-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${brainStatus?.connected ? 'bg-success animate-pulse-slow' : 'bg-slate-300'}`} />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{brainStatus?.pageCount ?? 0} pages indexed</p>
              <p className="text-xs text-slate-400 truncate">v{brainStatus?.version ?? '—'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-navy-600 bg-navy-950 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-navy-700 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
