/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#0066ff',
          cyan: '#00ffff',
          dark: '#050a14',
          surface: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
