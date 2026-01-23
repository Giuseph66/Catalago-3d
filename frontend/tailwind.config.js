/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (marca/ação)
        primary: {
          100: '#EEF2FF',
          500: '#6366F1',
          600: '#6366F1',
          700: '#4F46E5',
        },
        // Accent (tech/detalhe)
        accent: {
          100: '#CFFAFE',
          500: '#06B6D4',
        },
        // Estados
        success: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
        },
        info: {
          DEFAULT: '#7C3AED',
          soft: '#EDE9FE',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
        },
        // Neutros
        bg: '#F6F8FC',
        surface: '#FFFFFF',
        border: '#E6EAF2',
        text: '#0F172A',
        'text-2': '#475569',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '16px',
        button: '20px',
        chip: '12px',
        DEFAULT: '16px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(2, 8, 23, 0.08)',
        'card-hover': '0 14px 38px rgba(2, 8, 23, 0.12)',
      },
    },
  },
  plugins: [],
}

