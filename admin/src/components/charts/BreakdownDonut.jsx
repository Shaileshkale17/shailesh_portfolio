import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { pieColors, chartColors } from "../../lib/chartTheme";
import { formatNumber } from "../../lib/format";

/**
 * @param {{ data: Array<{ name: string, value: number }>, height?: number }} props
 */
const BreakdownDonut = ({ data, height = 220 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: height, height }} className="flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={pieColors[i % pieColors.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: chartColors.surfaceRaised,
                border: `1px solid ${chartColors.border}`,
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value, name) => [formatNumber(value), name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-text-secondary">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: pieColors[i % pieColors.length] }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="flex-shrink-0 font-medium text-text">
              {total ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BreakdownDonut;
