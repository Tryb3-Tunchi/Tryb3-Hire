import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-card": "var(--color-bg-card)",
        "bg-hover": "var(--color-bg-hover)",
        "border-main": "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-muted": "var(--color-accent-muted)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "col-violet": "var(--color-violet)",
        "col-amber": "var(--color-amber)",
        "col-cyan": "var(--color-cyan)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;