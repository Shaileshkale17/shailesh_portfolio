// Recharts needs literal color values (it renders SVG attributes, not
// className-driven elements), so these mirror tailwind.config.js's palette.
// Keep in sync manually if the design tokens there ever change.
export const chartColors = {
  primary: "#7c3aed",
  accent: "#22d3ee",
  success: "#34d399",
  error: "#f43f5e",
  border: "#2a2c36",
  textSecondary: "#9ba1ae",
  text: "#f5f5f7",
  surfaceRaised: "#1c1e27",
};

export const pieColors = ["#7c3aed", "#22d3ee", "#34d399", "#f59e0b", "#f43f5e", "#818cf8", "#ec4899", "#a3e635"];
