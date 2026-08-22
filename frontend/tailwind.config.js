/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F5F1E8',
          dark: '#15140F',
        },
        surface: {
          DEFAULT: '#FBF8EF',
          dark: '#1C1B16',
        },
        ink: {
          DEFAULT: '#1A1814',
          dark: '#EFEAD9',
          muted: '#736E63',
          'muted-dark': '#9A9384',
        },
        border: {
          DEFAULT: '#E5DECC',
          dark: '#2E2B23',
        },
        accent: {
          DEFAULT: '#1F4F58',
          soft: '#E2EDEC',
          softDark: '#1B2E31',
          ink: '#7BB6BC',
        },
        success: {
          DEFAULT: '#4F6D3F',
          soft: '#E7EDDF',
          softDark: '#1E2A1A',
        },
        warning: {
          DEFAULT: '#C57A2E',
          soft: '#F6E8D4',
          softDark: '#2E2316',
        },
        danger: {
          DEFAULT: '#A8443A',
          soft: '#F2DBD7',
          softDark: '#2E1A18',
        },
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'display-tight': '-0.022em',
        eyebrow: '0.18em',
      },
      borderRadius: {
        button: '10px',
        input: '10px',
        card: '14px',
        modal: '18px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 24, 20, 0.04), 0 8px 24px -12px rgba(26, 24, 20, 0.08)',
        'card-dark':
          '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px -12px rgba(0, 0, 0, 0.5)',
        elevated:
          '0 2px 4px rgba(26, 24, 20, 0.05), 0 24px 48px -20px rgba(26, 24, 20, 0.18)',
        focus: '0 0 0 3px rgba(31, 79, 88, 0.22)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      transitionDuration: {
        DEFAULT: '220ms',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
