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
        // VarshaSetu Climate Intelligence & Monsoon Observatory Design Tokens
        // ---------------------------------------------------------
        canvas: {
          DEFAULT: '#F3F6F7',
          secondary: '#EAF0F2',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#EAF0F2',
          highlight: '#E8F4F6',
          border: '#B8C5CC',
          dark: '#102A43',
          storm: '#0B1F33',
        },
        ink: {
          DEFAULT: '#102A43',
          primary: '#102A43',
          secondary: '#486581',
          muted: '#829AB1',
          border: '#B8C5CC',
          dark: '#0B1F33',
        },
        climate: {
          DEFAULT: '#0E7490',
          deep: '#155E75',
          cyan: '#0891B2',
          soft: '#E8F4F6',
        },
        atmosphere: {
          DEFAULT: '#0891B2',
          cyan: '#0891B2',
          soft: '#E8F4F6',
        },
        storm: {
          DEFAULT: '#102A43',
          navy: '#102A43',
          deep: '#0B1F33',
        },
        rain: {
          DEFAULT: '#2563EB',
          soft: '#DBEAFE',
        },
        amber: {
          DEFAULT: '#D97706',
          warm: '#D97706',
          soft: '#FEF3C7',
        },
        agri: {
          DEFAULT: '#3F7D58',
          green: '#3F7D58',
          soft: '#E4F0E8',
        },

        // Backward-compatible mapping for previous palette names
        ivory: {
          DEFAULT: '#F3F6F7',
          50: '#F8FAFA',
          100: '#F3F6F7',
          200: '#EAF0F2',
          300: '#D5DFE4',
        },
        teal: {
          DEFAULT: '#0E7490',
          deep: '#155E75',
          primary: '#0E7490',
          dark: '#155E75',
          light: '#0891B2',
          soft: '#E8F4F6',
        },
        sky: {
          soft: '#E8F4F6',
        },
        brand: {
          teal: {
            DEFAULT: '#0E7490',
            dark: '#155E75',
            light: '#0891B2',
            tint: '#E8F4F6',
            border: '#0891B2',
          },
          amber: {
            DEFAULT: '#D97706',
            dark: '#B45309',
            light: '#F59E0B',
            tint: '#FEF3C7',
            border: '#FCD34D',
          },
          azure: {
            DEFAULT: '#2563EB',
            dark: '#1D4ED8',
            light: '#3B82F6',
            tint: '#DBEAFE',
            border: '#93C5FD',
          },
          emerald: {
            DEFAULT: '#3F7D58',
            dark: '#2D5A3E',
            light: '#4E9A6D',
            tint: '#E4F0E8',
            border: '#A5D6B5',
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
        // Neo-brutalist crisp offset shadows & scientific elevation
        'brutal-sm': '2px 2px 0px #102A43',
        'brutal': '3px 3px 0px #102A43',
        'brutal-lg': '4px 4px 0px #102A43',
        'brutal-teal': '3px 3px 0px #155E75',
        'brutal-climate': '3px 3px 0px #155E75',
        'glass-card': '0 8px 30px rgba(16, 42, 67, 0.06)',
        card: '0 1px 3px rgba(16, 42, 67, 0.05), 0 1px 2px rgba(16, 42, 67, 0.03)',
        elevated: '0 4px 12px rgba(16, 42, 67, 0.08)',
        floating: '0 12px 32px -4px rgba(16, 42, 67, 0.12)',
      }
    },
  },
  plugins: [],
}
