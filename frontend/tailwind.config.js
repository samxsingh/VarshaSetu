/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF7F2',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F1EA',
          border: '#E5E0D8',
          dark: '#1E293B',
        },
        slate: {
          950: '#0B1120',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        brand: {
          teal: {
            DEFAULT: '#0D9488',
            dark: '#115E59',
            light: '#14B8A6',
            tint: '#F0FDFA',
            border: '#99F6E4',
          },
          amber: {
            DEFAULT: '#B45309',
            dark: '#92400E',
            light: '#D97706',
            tint: '#FEF3C7',
            border: '#FDE68A',
          },
          azure: {
            DEFAULT: '#0284C7',
            dark: '#0369A1',
            light: '#38BDF8',
            tint: '#E0F2FE',
            border: '#BAE6FD',
          },
          emerald: {
            DEFAULT: '#15803D',
            dark: '#166534',
            light: '#22C55E',
            tint: '#DCFCE7',
            border: '#BBF7D0',
          },
          crimson: {
            DEFAULT: '#DC2626',
            dark: '#991B1B',
            light: '#EF4444',
            tint: '#FEE2E2',
            border: '#FECACA',
          }
        }
      },
      fontFamily: {
        heading: ['Lexend', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        floating: '0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
