"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";

interface StatusData {
  status: string;
  count: number;
}

interface StatusDonutProps {
  data: StatusData[];
  title?: string;
}

const STATUS_LABELS: Record<string, string> = {
  WATCHING:      "Watching",
  PLAN_TO_WATCH: "Plan to Watch",
  COMPLETED:     "Completed",
  ON_HOLD:       "On Hold",
  DROPPED:       "Dropped",
  READING:       "Reading",
  PLAN_TO_READ:  "Plan to Read",
};

const STATUS_COLORS: Record<string, string> = {
  WATCHING:      "#6366f1",
  PLAN_TO_WATCH: "#94a3b8",
  COMPLETED:     "#22c55e",
  ON_HOLD:       "#eab308",
  DROPPED:       "#ef4444",
  READING:       "#a855f7",
  PLAN_TO_READ:  "#94a3b8",
};

export function StatusDonut({ data, title = "Status Breakdown" }: StatusDonutProps) {
  const { theme } = useTheme();
  const isDark    = theme === "dark";

  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: STATUS_LABELS[d.status] ?? d.status, value: d.count, status: d.status }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[180px]">
          <p className="text-sm text-muted-foreground">No entries yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLORS[entry.status] ?? "#6366f1"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "hsl(222 16% 12%)" : "#fff",
              border: "1px solid hsl(220 13% 91%)",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
