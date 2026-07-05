const Card = ({ children, className = "", padding = "p-6" }) => (
  <div className={`rounded-2xl border border-border bg-surface shadow-2 ${padding} ${className}`}>{children}</div>
);

export default Card;
