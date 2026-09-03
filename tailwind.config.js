/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'app-black': '#000000',
        'surface-base': '#121212',
        'surface-raised': '#181818',
        'surface-hover': '#1f1f1f',
        'surface-highlight': '#282828',
        'brand-green': '#1DB954',
        'brand-green-hover': '#1ed760',
        'text-subdued': '#a7a7a7',
        'text-muted': '#727272',
        'border-subtle': 'rgba(255,255,255,0.08)',
      },
      spacing: {
        22: '5.5rem',
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
