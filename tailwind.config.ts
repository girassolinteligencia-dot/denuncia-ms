import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta DENUNCIA MS (Logo Inspired)
        primary: {
          DEFAULT: '#021691', // Azul profundo do logo
          50:  '#E6E8F4',
          100: '#CCD1E9',
          200: '#99A3D3',
          300: '#6675BD',
          400: '#3347A7',
          500: '#021691',
          600: '#021274',
          700: '#010D57',
        },
        secondary: {
          DEFAULT: '#00843E', // Verde esmeralda do logo
          50:  '#E6F3EC',
          100: '#CCE7D9',
          200: '#99CFB3',
          300: '#66B78D',
          400: '#339F67',
          500: '#00843E',
        },
        electric: {
          DEFAULT: '#00D2D3', // Ciano neon das bordas
          glow: 'rgba(0, 210, 211, 0.4)',
        },
        accent: {
          DEFAULT: '#FFB81C', // Amarelo dourado do megafone
        },
        dark: {
          DEFAULT: '#010831',
        },
        // Semânticos
        success:  '#00843E',
        warning:  '#FFB81C',
        error:    '#DC2626',
        info:     '#00D2D3',
        // Neutros
        surface:  '#F0F2F9',
        border:   '#DDE1F0',
        muted:    '#64748B',
        text:     '#0F172A',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #021691 0%, #00843E 100%)',
        'gradient-electric': 'linear-gradient(90deg, #021691, #00D2D3, #00843E)',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 210, 211, 0.5)',
        'glow-green': '0 0 15px rgba(0, 132, 62, 0.5)',
        'card':    '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn .2s ease-out forwards',
        'slide-up':    'slideUp .4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'pulse-slow':  'pulseSlow 3s ease-in-out infinite',
        'marquee':     'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { 
          from: { opacity: '0', transform: 'translateY(20px)' }, 
          to: { opacity: '1', transform: 'translateY(0)' } 
        },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.7' } },
        pulseSlow: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
    },
  },
  plugins: [],
}

export default config
