"use client";

import Link from "next/link";

type Plan = { date: string; content: string | null; notes: string | null };
type WorkLog = { date: string; summary: string; minutes: number | null };

export default function ReviewSummary({
  period,
  plans,
  workLogs,
  start,
  end,
}: {
  period: string;
  plans: Plan[];
  workLogs: WorkLog[];
  start: string;
  end: string;
}) {
  const periods = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {periods.map((p) => (
          <Link
            key={p.value}
            href={`/reviews?period=${p.value}`}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              period === p.value ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        {start} – {end}
      </p>
      <div className="rounded border p-4 bg-gray-50 font-mono text-sm whitespace-pre-wrap" id="review-summary">
        <h3 className="font-semibold mb-2">Daily plans</h3>
        {plans.length === 0 ? (
          <p className="text-gray-500">No plans in this period.</p>
        ) : (
          plans.map((p) => (
            <div key={p.date} className="mb-4">
              <p className="font-medium text-gray-700">{p.date}</p>
              {p.content && <pre className="mt-1">{p.content}</pre>}
              {p.notes && <p className="mt-1 text-gray-600">Notes: {p.notes}</p>}
            </div>
          ))
        )}
        <h3 className="font-semibold mt-6 mb-2">Work log</h3>
        {workLogs.length === 0 ? (
          <p className="text-gray-500">No work log entries in this period.</p>
        ) : (
          workLogs.map((w) => (
            <div key={w.date + w.summary} className="mb-2">
              <span className="text-gray-700">{w.date}</span> — {w.summary}
              {w.minutes != null && ` (${w.minutes} min)`}
            </div>
          ))
        )}
      </div>
      <p className="text-sm text-gray-600">
        Copy the content above to share with your manager for 1:1s or formal reviews.
      </p>
    </div>
  );
}
