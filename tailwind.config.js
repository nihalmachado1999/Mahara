/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EF",
        "cream-warm": "#F2E9DB",
        crimson: "#9B1B30",
        "crimson-deep": "#6E1322",
        "crimson-soft": "#F4DCDF",
        ink: "#1A1410",
        "ink-soft": "#4A4038",
        gold: "#B8924A",
      },
      fontFamily: {
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
}
