"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type EnergyTrendChartProps = {
  data: { date: string; energy: number }[];
};

export function EnergyTrendChart({ data }: EnergyTrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 10]}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
