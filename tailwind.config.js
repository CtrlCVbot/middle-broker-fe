/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(255, 255, 255, 0.6)' },
          '50%': { boxShadow: '0 0 8px 4px rgba(255, 255, 255, 0.8)' },
        },        
      },
      animation: {
        glow: 'glow 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}