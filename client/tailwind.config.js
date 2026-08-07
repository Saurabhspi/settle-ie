/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#F7F3EB',
          100: '#EDE8DC',
          200: '#DDD8CC',
          300: '#B8C4BC',
          400: '#7A8C7E',
          500: '#5A6B5E',
          600: '#2A5C3E',
          700: '#1A3D2B',
          800: '#0F2A1E',
          900: '#081A12',
        },
        cream: {
          50:  '#FDFBF7',
          100: '#F7F3EB',
          200: '#EDE8DC',
          300: '#DDD8CC',
        },
        emerald: {
          400: '#5DCAA5',
          500: '#1D9E75',
          600: '#0F6E56',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}