/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        slate: {
          950: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

