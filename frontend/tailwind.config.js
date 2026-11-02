/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (marca/ação): azul cobalto da capa
        primary: {
          DEFAULT: '#2340C8',
          50: '#F1F3FC',
          100: '#E4E9FB',
          200: '#C5CFF4',
          500: '#2340C8',
          600: '#2340C8',
          700: '#1A2F96',
        },
        // Accent: laranja do filamento
        accent: {
          DEFAULT: '#FF5A1F',
          100: '#FFE6DB',
          500: '#FF5A1F',
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
        // Editorial (Home)
        paper: '#ECEEF1',
        ink: '#16181D',
        cobalt: { DEFAULT: '#2340C8', deep: '#1A2F96' },
        filament: '#FF5A1F',
        // Neutros
        bg: '#ECEEF1',
        surface: '#FFFFFF',
        border: '#D9DCE2',
        text: '#16181D',
        'text-2': '#4A4F5A',
        muted: '#6B717C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '12px',
        input: '10px',
        button: '9999px',
        chip: '9999px',
        DEFAULT: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 24, 29, 0.06)',
        'card-hover': '0 6px 20px rgba(22, 24, 29, 0.08)',
      },
    },
  },
  plugins: [],
}

