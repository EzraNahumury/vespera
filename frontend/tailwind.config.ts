import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["TT Norms Pro", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        green: {
          light: "#86EFAC",
          mid: "#4ADE80",
          dark: "#14532D",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
