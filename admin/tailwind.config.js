/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0c10",
        surface: "#14151c",
        "surface-raised": "#1c1e27",
        primary: "#7c3aed",
        accent: "#22d3ee",
        border: "#2a2c36",
        text: "#f5f5f7",
        "text-secondary": "#9ba1ae",
        error: "#f43f5e",
        success: "#34d399",
      },
      fontFamily: {
        heading: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
