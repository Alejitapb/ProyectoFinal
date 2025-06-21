/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FFD700',
        'primary-orange': '#FF8C00',
        'primary-red': '#FF4500',
        'accent-red': '#DC143C',
        'gray-light': '#F5F5F5',
        'gray-medium': '#CCCCCC',
        'gray-dark': '#666666',
      },
    },
  },
  plugins: [],
}