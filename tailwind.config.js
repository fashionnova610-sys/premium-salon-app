/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FFBF00", // Aura Noir Gold
        background: "#131313", // Aura Noir Dark
      }
    },
  },
  plugins: [],
}
