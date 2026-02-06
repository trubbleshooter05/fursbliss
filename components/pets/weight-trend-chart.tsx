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

type WeightTrendChartProps = {
  data: { date: string; weight: number }[];
};

export function WeightTrendChart({ data }: WeightTrendChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#64748b"
            strokeWidth={3}
            dot={{ fill: "#64748b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
