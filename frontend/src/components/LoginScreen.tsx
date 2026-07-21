import { Search, Sparkles, Shield } from 'lucide-react';
import AndroidDownloadLink from './AndroidDownloadLink';

interface Props {
  onLogin: () => void;
}

const features = [
  { icon: Search,   title: 'Hybrid Search',    desc: 'Vector + BM25 search across your knowledge' },
  { icon: Sparkles, title: 'AI Synthesis',      desc: 'Answers with citations from your own docs'  },
  { icon: Shield,   title: 'Private by Design', desc: 'Your data is completely isolated and secure' },
];

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

/** Minimal orange orb — matches mobile design */
function Orb() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
      {/* Teal ground shadow */}
      <div className="absolute bottom-0 w-16 h-5 rounded-full bg-accent-light/20 blur-sm" />
      {/* Orange sphere */}
      <div
        className="w-16 h-16 rounded-full bg-accent relative"
        style={{ boxShadow: '0 8px 24px rgba(239,85,32,0.40)' }}
      >
        {/* Specular highlight */}
        <div className="absolute top-3 left-4 w-6 h-4 rounded-full bg-white/30 -rotate-12" />
      </div>
    </div>
  );
}

export default function LoginScreen({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Headline */}
        <div className="mb-8">
          <h1
            className="text-6xl font-extralight text-slate-900 tracking-tight leading-none mb-4"
            style={{ letterSpacing: '-2px' }}
          >
            Hello.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            I am XandaCross,<br />
            your personal knowledge brain.
          </p>
        </div>

        {/* Orb */}
        <Orb />

        {/* Feature list */}
        <div className="space-y-2.5 mb-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 bg-navy-800 border border-navy-600 rounded-xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-light/10 border border-accent-light/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-accent-light" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary: Google */}
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-[0.99]"
        >
          <GoogleLogo />
          <span className="text-[15px]">Continue with Google</span>
        </button>


        <p className="text-center text-xs text-slate-400 mt-4">
          Your knowledge is private and only visible to you.
        </p>

        <div className="flex justify-center">
          <AndroidDownloadLink />
        </div>
      </div>
    </div>
  );
}
