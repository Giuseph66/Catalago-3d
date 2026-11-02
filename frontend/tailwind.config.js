// Cores vêm de variáveis CSS (src/index.css) para o tema Grafite trocar entre dia e noite.
// Os canais RGB separados mantêm os modificadores de opacidade, como bg-ink/10.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const grays = Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [step, v(`gray-${step}`)])
);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "white" é a superfície de cards e campos: escurece no modo noite
        white: v('surface'),
        gray: grays,
        slate: grays,
        // Ação principal: tinta sobre papel no dia, papel sobre grafite à noite
        primary: {
          DEFAULT: v('primary'),
          50: v('primary-50'),
          100: v('primary-100'),
          200: v('primary-200'),
          400: v('primary-400'),
          500: v('primary'),
          600: v('primary'),
          700: v('primary-700'),
        },
        'on-primary': v('on-primary'),
        // Detalhe laranja do filamento
        accent: {
          DEFAULT: v('filament'),
          100: v('filament-soft'),
          500: v('filament'),
        },
        filament: v('filament'),
        // Estados
        success: { DEFAULT: v('success'), soft: v('success-soft') },
        warning: { DEFAULT: v('warning'), soft: v('warning-soft') },
        info: { DEFAULT: v('info'), soft: v('info-soft') },
        danger: { DEFAULT: v('danger'), soft: v('danger-soft') },
        ok: v('ok'),
        // Editorial
        paper: v('paper'),
        ink: v('ink'),
        soft: v('soft'),
        cover: v('cover'),
        'on-cover': v('on-cover'),
        // Faixas que continuam escuras nos dois modos (rodapé, barra do painel)
        night: v('night'),
        'on-night': v('on-night'),
        // Ênfase de links e foco: segue a tinta no Grafite
        cobalt: { DEFAULT: v('ink'), deep: v('ink') },
        // Neutros
        bg: v('paper'),
        surface: v('surface'),
        border: v('line'),
        text: v('ink'),
        'text-2': v('text-2'),
        muted: v('muted'),
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
        card: '0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 6px 20px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
}
