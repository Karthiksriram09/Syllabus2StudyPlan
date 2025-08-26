
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef4ff", 100:"#d9e6ff", 200:"#b3caff", 300:"#8daeff",
                 400:"#6691ff", 500:"#4075ff", 600:"#305bdb", 700:"#2648aa",
                 800:"#1c3579", 900:"#142656" }
      },
      boxShadow: { glow: "0 0 0 3px rgba(64,117,255,0.25)" }
    }
  },
  plugins: [],
}
