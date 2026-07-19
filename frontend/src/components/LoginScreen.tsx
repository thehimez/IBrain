import { Brain, Sparkles, Shield, Search } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onLoginReplit?: () => void;
}

const features = [
  { icon: Search,   title: 'Hybrid Search',   desc: 'Vector + BM25 search across your knowledge' },
  { icon: Sparkles, title: 'AI Synthesis',     desc: 'Answers with citations from your own docs'  },
  { icon: Shield,   title: 'Private by Design', desc: 'Your data is completely isolated and secure' },
];

/** Google SVG logo — per Google's branding guidelines. */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginScreen({ onLogin, onLoginReplit }: Props) {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center glow-blue-sm mb-4">
            <Brain size={32} className="text-accent-light" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">XandaCross</h1>
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

        {/* Primary: Google Sign-In */}
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg border border-gray-200 active:scale-[0.99]"
        >
          <GoogleLogo />
          <span className="text-[15px]">Continue with Google</span>
        </button>

        {/* Secondary: Replit (legacy, shown only when available) */}
        {onLoginReplit && (
          <button
            onClick={onLoginReplit}
            className="w-full flex items-center justify-center gap-3 mt-3 bg-navy-800/60 hover:bg-navy-700/60 text-slate-300 hover:text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-150 border border-navy-600 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Sign in with Replit
          </button>
        )}

        <p className="text-center text-xs text-slate-500 mt-4">
          Your knowledge is private and only visible to you.
        </p>
      </div>
    </div>
  );
}
