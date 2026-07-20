/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Remapped to light theme — component class names stay the same
        navy: {
          950: '#f8f7f5',   // main beige bg
          900: '#fafafa',   // off-white bg
          800: '#ffffff',   // white cards
          700: '#f4f3f1',   // subtle hover
          600: '#e7eaed',   // borders
          500: '#d1d5db',   // heavier borders
          400: '#9ca3af',   // muted text
        },
        accent: {
          DEFAULT: '#ef5520',  // orange — CTAs, send button
          light:   '#497e7e',  // teal — links, highlights
          dim:     '#224348',  // dark teal
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-in':   'slideIn 0.2s ease-out',
        'typing':     'typing 1.2s steps(3, end) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        typing:  { '0%, 100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
