import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Override Tailwind's default gray colors with light theme colors
        gray: {
          50: "#fbffff",   // oq (background)
          100: "#edf1f1",  // och kulrang
          200: "#edf1f1",
          300: "#edf1f1",
          400: "#232324",  // qora (foreground)
          500: "#232324",
          600: "#232324",
          700: "#000000",  // qora
          800: "#fbffff",  // oq (inverted for light mode)
          900: "#fbffff",  // oq (inverted for light mode)
          950: "#fbffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
