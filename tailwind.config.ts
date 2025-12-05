import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        "city-blue": "#1A4D7A",
        "gospel-gold": "#D9A441",
        // Secondary colors
        "urban-steel": "#4A4F57",
        "light-city-gray": "#DCE1E5",
        "warm-sand": "#F3E9D7",
        // Accent colors
        "movement-teal": "#2F8F8C",
        "grace-coral": "#E47A62",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

