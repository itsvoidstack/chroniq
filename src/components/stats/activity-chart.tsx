"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";

interface MonthData {
  label: string;
  episodes: number;
  chapters: number;
  movies: number;
}

interface ActivityChartProps {
  data: MonthData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor  = isDark ? "hsl(222 16% 18%)" : "hsl(220 13% 91%)";
  const textColor  = isDark ? "hsl(215 14% 55%)"  : "hsl(220 9% 46%)";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Activity — Last 12 Months</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "hsl(222 16% 12%)" : "#fff",
              border: `1px solid ${gridColor}`,
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Line type="monotone" dataKey="episodes" name="Episodes" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="movies"   name="Movies"   stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="chapters" name="Chapters" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
