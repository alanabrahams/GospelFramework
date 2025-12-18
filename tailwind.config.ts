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
        // Landing page colors
        "movement-teal": "#2F8F8C", // Teal accent color for completed states
        "grace-coral": "#F87171", // Coral/red for errors
        "redeemer-red": "#DC2626", // Red for logo/brand
        
        // Assessment & Results page colors
        "warm-sand": "#F5F1E8", // Warm beige/cream background
        "city-blue": "#1A4D7A", // Main blue color
        "urban-steel": "#4A5568", // Dark gray text color
        "gospel-gold": "#D9A441", // Yellow/gold accent color
        "light-city-gray": "#E2E8F0", // Light gray for borders and backgrounds
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-pattern': '20px 20px',
      },
    },
  },
  plugins: [],
};
export default config;
