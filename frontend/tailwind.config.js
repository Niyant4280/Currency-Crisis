/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: "#0f172a", // slate-900
        card: "#1e293b",       // slate-800
        textLight: "#f8fafc",  // slate-50
        textMuted: "#94a3b8",  // slate-400
        slate: {
          850: '#151f32',
          950: '#0b1120',
        }
      }
    },
  },
  plugins: [],
}
