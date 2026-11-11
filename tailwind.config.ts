import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#0a1020", emerald: "#10b981", royal: "#4361ee", violet: "#8b5cf6", teal: "#2dd4bf", coral: "#ff6f61", gold: "#f6c453" },
    fontFamily: { display: ["Georgia", "'Iowan Old Style'", "serif"] } } },
  plugins: [],
} satisfies Config;
