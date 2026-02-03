import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#0a0a0f",
          card: "#12121a",
          "card-hover": "#16161f",
          border: "#1e1e2e",
          accent: "#00ff88",
          "accent-dim": "#00ff8820",
          red: "#ff4444",
          "red-dim": "#ff444420",
          yellow: "#ffaa00",
          muted: "#666680",
          text: "#e0e0f0",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
