import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartColors } from "../../lib/chartTheme";
import { formatShortDate, formatNumber } from "../../lib/format";

/**
 * @param {{ data: Array<{ date: string, visitors: number }>, height?: number }} props
 */
const GrowthAreaChart = ({ data, height = 260 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id="visitorGrowthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.35} />
          <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="date"
        tickFormatter={formatShortDate}
        stroke={chartColors.textSecondary}
        tick={{ fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: chartColors.border }}
        minTickGap={24}
      />
      <YAxis
        stroke={chartColors.textSecondary}
        tick={{ fontSize: 11 }}
        tickLine={false}
        axisLine={false}
        allowDecimals={false}
        width={32}
      />
      <Tooltip
        contentStyle={{
          background: chartColors.surfaceRaised,
          border: `1px solid ${chartColors.border}`,
          borderRadius: 12,
          fontSize: 12,
        }}
        labelStyle={{ color: chartColors.textSecondary }}
        labelFormatter={formatShortDate}
        formatter={(value) => [formatNumber(value), "Visitors"]}
      />
      <Area
        type="monotone"
        dataKey="visitors"
        stroke={chartColors.primary}
        strokeWidth={2}
        fill="url(#visitorGrowthFill)"
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default GrowthAreaChart;
