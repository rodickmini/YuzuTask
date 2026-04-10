/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7EB6C9',
        'primary-light': '#A8D4E2',
        'primary-dark': '#5A97AB',
        accent: '#F5A7A7',
        'accent-light': '#FCCFCF',
        mint: '#A8D5BA',
        'mint-light': '#C8E8D4',
        cream: '#FFD4A5',
        'cream-light': '#FFE6C4',
        warm: '#FFF8F0',
        'warm-dark': '#F0E6DE',
        'text-main': '#4A4A4A',
        'text-sub': '#9B9B9B',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Hiragino Sans"', '"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(126, 182, 201, 0.1)',
        'soft-lg': '0 4px 25px rgba(126, 182, 201, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(126,182,201,0.08)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'petal': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) rotate(360deg)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'petal': 'petal 1s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'typewriter': 'typewriter 2s steps(40) forwards',
      },
    },
  },
  plugins: [],
}
