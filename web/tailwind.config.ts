/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      /**
       * Font-Families
       * -----------------------------
       * Anbindung an next/font über CSS-Variablen
       *
       * - font-sans   → Inter (Standard UI / Text)
       * - font-serif  → Playfair Display (Headlines / Einstiegsfragen)
       */
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        "brand-navy": "#1B3040",
        "brand-sandstone": "#EDE7DD",
        "brand-graphite": "#42484F",
        "brand-brackish": "#354C52",
        "brand-brass": "#8B6F3D",
      },
    },
  },

  plugins: [],
};

export default config;
