/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060c18',
          900: '#080e1a',
          800: '#0d1526',
          700: '#111e33',
          600: '#162040',
          500: '#1c2a50',
          400: '#243360',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dim: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'typing': 'typing 1.2s steps(3, end) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        typing: { '0%, 100%': { opacity: '0.2' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
