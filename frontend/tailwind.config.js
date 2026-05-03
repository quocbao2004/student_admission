/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Vibrant Blue
        navy: "#0f172a",    // Slate 900
      }
    },
  },
  plugins: [],
}
