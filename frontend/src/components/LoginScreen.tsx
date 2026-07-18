import { Brain, Sparkles, Shield, Search } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const features = [
  { icon: Search,    title: 'Hybrid Search',        desc: 'Vector + BM25 search across your knowledge' },
  { icon: Sparkles,  title: 'AI Synthesis',          desc: 'Answers with citations from your own docs' },
  { icon: Shield,    title: 'Private by Design',     desc: 'Your data is completely isolated and secure' },
];

export default function LoginScreen({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center glow-blue-sm mb-4">
            <Brain size={32} className="text-accent-light" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GBrain</h1>
          <p className="text-slate-400 mt-2 text-center text-sm leading-relaxed">
            Your personal knowledge brain — upload documents,<br />
            extract insights, ask anything.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-navy-800/60 border border-navy-600 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-accent-light" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Sign in with Replit
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Your knowledge is private and only visible to you.
        </p>
      </div>
    </div>
  );
}
