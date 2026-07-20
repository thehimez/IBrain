export const Colors = {
  // Backgrounds
  bg: {
    primary: '#f8f7f5',    // light beige
    secondary: '#ffffff',  // true white (cards)
    tertiary: '#fafafa',   // off-white
    input: '#ffffff',
  },
  // Borders
  border: {
    default: '#e7eaed',    // light grey
    subtle: '#f0efed',
    focus: '#497e7e',      // teal
  },
  // Text
  text: {
    primary: '#1e1e1e',    // off-black
    secondary: '#6b7280',
    muted: '#9ca3af',
    disabled: '#d1d5db',
  },
  // Primary accent — Teal
  accent: {
    default: '#497e7e',
    dim: '#224348',
    light: '#497e7e',
    bg: 'rgba(73,126,126,0.08)',
    border: 'rgba(73,126,126,0.25)',
  },
  // CTA — Orange
  orange: '#ef5520',
  orangeLight: 'rgba(239,85,32,0.10)',
  orangeBorder: 'rgba(239,85,32,0.30)',
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  // Tab bar
  tab: {
    active: '#497e7e',
    inactive: '#b0b8c1',
    bg: '#ffffff',
  },
} as const;
