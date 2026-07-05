const Chip = ({ children, className = "" }) => (
  <span
    className={`inline-block rounded-full border border-border bg-surface-raised px-3.5 py-1.5 text-sm text-text shadow-1 transition-transform duration-200 hover:scale-105 ${className}`}
  >
    {children}
  </span>
);

export default Chip;
