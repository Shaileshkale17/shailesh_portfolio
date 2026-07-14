/** Formats a date as a short relative time string, e.g. "5m ago", "3h ago", "2d ago". */
export const timeAgo = (date) => {
  const diffMs = Math.max(0, Date.now() - new Date(date).getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

/** Formats a number with thousands separators, e.g. 12400 -> "12,400". */
export const formatNumber = (n) => new Intl.NumberFormat().format(n ?? 0);

/** Formats a short date, e.g. "Jul 13". Used for chart axis ticks. */
export const formatShortDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
