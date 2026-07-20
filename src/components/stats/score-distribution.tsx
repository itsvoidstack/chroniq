"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

interface ScoreData {
  score: number;
  count: number;
}

interface ScoreDistributionProps {
  data: ScoreData[];
  title?: string;
}

const SCORE_COLORS = [
  "#ef4444", "#f97316", "#f97316", "#eab308", "#eab308",
  "#84cc16", "#84cc16", "#22c55e", "#22c55e", "#16a34a",
];

export function ScoreDistribution({ data, title = "Score Distribution" }: ScoreDistributionProps) {
  const { theme } = useTheme();
  const isDark    = theme === "dark";
  const gridColor = isDark ? "hsl(222 16% 18%)" : "hsl(220 13% 91%)";
  const textColor = isDark ? "hsl(215 14% 55%)"  : "hsl(220 9% 46%)";

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[160px]">
          <p className="text-sm text-muted-foreground">No ratings yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="score" tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "hsl(222 16% 12%)" : "#fff",
              border: `1px solid ${gridColor}`,
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(value: number) => [value, "Titles"]}
          />
          <Bar dataKey="count" name="Titles" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={SCORE_COLORS[i] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
