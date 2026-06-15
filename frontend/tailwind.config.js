/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#A100FF", // Accenture purple
          dark: "#7500C0",
        },
      },
    },
  },
  plugins: [],
};
