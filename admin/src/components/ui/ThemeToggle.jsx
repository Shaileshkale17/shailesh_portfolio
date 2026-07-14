import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * Animated sun/moon toggle switch for dark/light mode. Used in the
 * Sidebar (and could be dropped anywhere else that needs it).
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative flex h-8 w-14 items-center rounded-full border border-border bg-surface-raised px-1 transition-colors"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs"
        style={{ marginLeft: isDark ? "auto" : 0 }}
      >
        {isDark ? "🌙" : "☀️"}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
