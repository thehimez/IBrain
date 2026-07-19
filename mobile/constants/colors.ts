export const Colors = {
  // Backgrounds
  bg: {
    primary: '#0f172a',    // navy-900
    secondary: '#1e293b',  // navy-800
    tertiary: '#1e3a5f',   // navy-700
    input: '#0f172a',
  },
  // Borders
  border: {
    default: '#334155',    // navy-600 / slate-700
    subtle: '#1e3a5f',     // navy-700
    focus: '#3b82f6',
  },
  // Text
  text: {
    primary: '#f1f5f9',    // white-ish
    secondary: '#94a3b8',  // slate-400
    muted: '#64748b',      // slate-500
    disabled: '#475569',   // slate-600
  },
  // Accent / Brand
  accent: {
    default: '#3b82f6',    // blue-500
    dim: '#2563eb',        // blue-600
    light: '#60a5fa',      // blue-400
    bg: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.3)',
  },
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  // Tab bar
  tab: {
    active: '#60a5fa',
    inactive: '#64748b',
  },
} as const;
