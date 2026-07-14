/**
 * Renders a GitHub-style contribution grid from a flat list of
 * { date, contributionCount } days (as returned by githubIntegrationService).
 * @param {{ days: Array<{ date: string, contributionCount: number }> }} props
 */
const ContributionGrid = ({ days }) => {
  if (!days?.length) return null;

  const max = Math.max(...days.map((d) => d.contributionCount), 1);
  const bucket = (count) => {
    if (count === 0) return "bg-surface-raised";
    const ratio = count / max;
    if (ratio > 0.75) return "bg-primary";
    if (ratio > 0.5) return "bg-primary/70";
    if (ratio > 0.25) return "bg-primary/40";
    return "bg-primary/20";
  };

  // Group into weeks (columns), Sunday-start, matching GitHub's own layout.
  const weeks = [];
  let currentWeek = [];
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (new Date(day.date).getDay() === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}`}
                className={`h-2.5 w-2.5 rounded-sm ${bucket(day.contributionCount)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGrid;
