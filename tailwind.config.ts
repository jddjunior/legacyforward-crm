/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#146c43',
          50: '#f1f8f3',
          100: '#e3f1e8',
          200: '#c6decf',
          300: '#9bc4a9',
          400: '#6ba37e',
          500: '#146c43',
          600: '#0f5132',
          700: '#0b3d26',
          800: '#072819',
          900: '#04150e',
        },
        accent: { DEFAULT: '#ffc400', 50: '#fffdf0', 100: '#fff9d6', 200: '#fff3d1' },
        ink: {
          DEFAULT: '#14141a',
          heading: '#14141a',
          muted: '#5f5f66',
          subtle: '#75737f',
          faint: '#918da0',
          line: '#e9e6de',
          lineSoft: '#efede7',
          surface: '#e6e3dc',
          panel: '#f6f5f1',
          card: '#ffffff',
        },
        danger: { DEFAULT: '#b02a12', bright: '#cf1c0c' },
        warn: { DEFAULT: '#8a5a00', bg: '#fff3d1' },
        ok: { DEFAULT: '#1f6b18', bg: '#f1f8f3' },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['2.125rem', { lineHeight: '1.1', letterSpacing: '-0.038em' }],
      },
      borderRadius: {
        '13': '13px',
      },
    },
  },
  plugins: [],
};
