"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type Period = "week" | "month" | "all";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as Period) || "week";
  const validPeriod = PERIOD_OPTIONS.some((o) => o.value === period) ? period : "week";

  function setPeriod(value: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`/?${params}`);
  }

  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-600/50 bg-[#282a3a]">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setPeriod(opt.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            validPeriod === opt.value ? "bg-[var(--accent-red)] text-white" : "text-white hover:bg-white/10"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
