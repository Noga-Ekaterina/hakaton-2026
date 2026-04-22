import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4efe6",
        foreground: "#1f2937",
        card: "#fff9f0",
        border: "#d1b894",
        primary: "#c05621",
        accent: "#14532d",
        muted: "#6b7280",
      },
      boxShadow: {
        warm: "0 18px 40px rgba(192, 86, 33, 0.15)",
      },
      borderRadius: {
        xl: "1rem",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
