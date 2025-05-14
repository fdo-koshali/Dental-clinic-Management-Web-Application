/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#1d4ed8",
      }
    },
    width: {
      'calc': 'calc(100% - 200px)',
    },
  },
  plugins: [],
}

