"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type Period = "week" | "month" | "all";
type ChartDataPoint = { day: string; count: number };

export function PeriodSelector() {
  const [period, setPeriod] = useState<Period>("week");
  const options: { value: Period; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "all", label: "All" },
  ];
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-600/50 bg-[#282a3a]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setPeriod(opt.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            period === opt.value ? "bg-[var(--accent-red)] text-white" : "text-white hover:bg-white/10"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function WorkLogActivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#282a3a",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#f8fafc" }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--accent-red)"
            strokeWidth={2}
            dot={{ fill: "var(--accent-red)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GoalsProgressChart({ activeGoals, completedGoals }: { activeGoals: number; completedGoals: number }) {
  const data = [
    { day: "Active", count: activeGoals },
    { day: "Completed", count: completedGoals },
  ];
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#282a3a",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
