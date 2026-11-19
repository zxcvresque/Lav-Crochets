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
        brand: {
          50: "var(--joy-50)",
          100: "var(--joy-100)",
          200: "var(--joy-200)",
          300: "var(--joy-300)",
          400: "var(--joy-400)",
          500: "var(--joy-500)",
          600: "var(--joy-600)",
          700: "var(--joy-700)",
          800: "var(--joy-800)",
          900: "var(--joy-900)",
          950: "var(--joy-950)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        italic: ["var(--font-italic)"],
      },
    },
  },
  plugins: [],
};

export default config;
