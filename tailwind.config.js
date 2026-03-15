/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deloitte: {
          green: '#86BC25',
          black: '#000000',
          'dark-gray': '#53565A',
          'med-gray': '#747678',
          'light-gray': '#D0D0CE',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
