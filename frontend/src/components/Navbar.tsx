import { Brain, Menu, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: Props) {
  const { getCurrentBrain, brainStatus } = useApp();
  const { user } = useAuth();
  const connected = brainStatus?.connected ?? false;
  const initials = user?.name ? user.name.slice(0, 1).toUpperCase() : 'U';

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-navy-600 bg-navy-800/80 backdrop-blur-sm z-30 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-navy-700 text-slate-400 hover:text-white transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center glow-blue-sm">
            <Brain size={16} className="text-accent-light" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">GBrain</span>
        </div>
      </div>

      {/* Center — brain name */}
      <div className="hidden sm:flex items-center gap-2 bg-navy-700/60 border border-navy-600 rounded-lg px-3 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-slate-300">{getCurrentBrain()}</span>
      </div>

      {/* Right — status */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            connected
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{connected ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-accent/30 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent-light">
            {initials}
          </div>
        )}
        {user?.name && (
          <span className="hidden md:block text-xs text-slate-300 font-medium max-w-[120px] truncate">
            {user.name}
          </span>
        )}
      </div>
    </header>
  );
}
