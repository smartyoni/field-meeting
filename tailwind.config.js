/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#F7F6F3', 
        text: '#37352F',
        muted: '#9B9A97',
        accent: '#0F62FE',
        success: '#0F7B0F',
        warning: '#E79700',
        error: '#E5484D',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}