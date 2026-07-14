import { motion } from "framer-motion";

// Static class strings (not built dynamically) so Tailwind's JIT scanner can find them.
const ACCENT_STYLES = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
};

const ACCENT_GLOW = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  success: "bg-success/10",
  error: "bg-error/10",
};

/**
 * @param {{ icon?: React.ComponentType, label: string, value: React.ReactNode, hint?: string, loading?: boolean, accent?: "primary"|"accent"|"success"|"error", delay?: number }} props
 */
const StatCard = ({ icon: Icon, label, value, hint, loading, accent = "primary", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay }}
    className="card relative overflow-hidden"
  >
    <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${ACCENT_GLOW[accent]}`} />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
        {loading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-surface-raised" />
        ) : (
          <p className="mt-1 truncate font-heading text-2xl font-bold text-text">{value}</p>
        )}
        {hint && <p className="mt-1 truncate text-xs text-text-secondary">{hint}</p>}
      </div>
      {Icon && (
        <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${ACCENT_STYLES[accent]}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  </motion.div>
);

export default StatCard;
