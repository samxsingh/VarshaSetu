/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---------------------------------------------------------
        // VarshaSetu Editorial & Neo-Brutalist Design Tokens
        // ---------------------------------------------------------
        ivory: {
          DEFAULT: '#F7F3EA',
          50: '#FDFBF7',
          100: '#F7F3EA',
          200: '#EFE7D8',
          300: '#E2D5BE',
        },
        ink: {
          DEFAULT: '#0B1726',
          primary: '#0B1726',
          secondary: '#435466',
          muted: '#62768A',
          border: '#D8D3C5',
          dark: '#08101C',
        },
        teal: {
          DEFAULT: '#008F83',
          deep: '#006B65',
          primary: '#008F83',
          dark: '#006B65',
          light: '#14A396',
          soft: '#DCEFF0',
        },
        agri: {
          green: '#2F7D4A',
          soft: '#DDEBDD',
        },
        amber: {
          warm: '#E5A33D',
          soft: '#F7E8C7',
        },
        sky: {
          soft: '#DCEFF0',
        },

        // Backward-compatible tokens for existing pages
        canvas: '#F7F3EA',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F1EA',
          border: '#E2DDD2',
          dark: '#0B1726',
        },
        brand: {
          teal: {
            DEFAULT: '#008F83',
            dark: '#006B65',
            light: '#14A396',
            tint: '#DCEFF0',
            border: '#99E1DC',
          },
          amber: {
            DEFAULT: '#E5A33D',
            dark: '#B87A1E',
            light: '#F3B555',
            tint: '#F7E8C7',
            border: '#ECD096',
          },
          azure: {
            DEFAULT: '#0284C7',
            dark: '#0369A1',
            light: '#38BDF8',
            tint: '#E0F2FE',
            border: '#BAE6FD',
          },
          emerald: {
            DEFAULT: '#2F7D4A',
            dark: '#1F5E35',
            light: '#3EA362',
            tint: '#DDEBDD',
            border: '#B7D6B7',
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
        // Neo-brutalist crisp offset shadows & editorial elevation
        'brutal-sm': '2px 2px 0px #0B1726',
        'brutal': '3px 3px 0px #0B1726',
        'brutal-lg': '5px 5px 0px #0B1726',
        'brutal-teal': '3px 3px 0px #006B65',
        'glass-card': '0 8px 30px rgba(11, 23, 38, 0.06)',
        card: '0 1px 3px rgba(11, 23, 38, 0.05), 0 1px 2px rgba(11, 23, 38, 0.03)',
        elevated: '0 4px 12px rgba(11, 23, 38, 0.08)',
        floating: '0 12px 32px -4px rgba(11, 23, 38, 0.12)',
      }
    },
  },
  plugins: [],
}
