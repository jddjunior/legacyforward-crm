/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#335aea',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#335aea',
          600: '#2942cc',
          700: '#1f33a3',
          800: '#1a2882',
          900: '#172066',
        },
        accent: { DEFAULT: '#ffc400', 50: '#fffdf0', 100: '#fff9d6' },
        ink: {
          DEFAULT: '#1a1a22',
          muted: '#6b6b76',
          subtle: '#9a9aa3',
          line: '#e8e6e0',
          surface: '#f6f5f1',
          card: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['1.875rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
    },
  },
  plugins: [],
};
