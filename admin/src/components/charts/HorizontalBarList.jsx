import { motion } from "framer-motion";

/**
 * @param {{ data: Array<{ label: string, value: number }>, emptyLabel?: string }} props
 */
const HorizontalBarList = ({ data, emptyLabel = "No data yet" }) => {
  if (!data.length) return <p className="py-6 text-center text-sm text-text-secondary">{emptyLabel}</p>;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-text-secondary">{d.label}</span>
            <span className="flex-shrink-0 font-medium text-text">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default HorizontalBarList;
