/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
      },
      fontFamily: {
        heading: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        1: "0 1px 2px rgba(0,0,0,.06)",
        2: "0 4px 12px rgba(0,0,0,.10)",
        3: "0 12px 32px rgba(0,0,0,.16)",
        glow: "0 0 40px rgba(124,58,237,.35)",
      },
    },
  },
  plugins: [],
};
