"use client";

import Link from "next/link";
import { useTransition } from "react";
import { addReviewEntry } from "./actions";

type Plan = { date: string; content: string | null; notes: string | null };
type WorkLog = { date: string; summary: string; minutes: number | null };
type ReviewEntry = { id: string; content: string; created_at: string };

export default function ReviewSummary({
  period,
  plans,
  workLogs,
  reviewEntries,
  start,
  end,
}: {
  period: string;
  plans: Plan[];
  workLogs: WorkLog[];
  reviewEntries: ReviewEntry[];
  start: string;
  end: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleAddReview(formData: FormData) {
    startTransition(async () => {
      await addReviewEntry(formData);
    });
  }
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
              period === p.value ? "bg-[var(--accent-red)] text-white" : "text-slate-300 bg-white/10 hover:bg-white/20 border border-slate-600"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <p className="text-sm text-slate-400">
        {start} – {end}
      </p>
      <div className="card-bg p-5 rounded-xl space-y-4">
        <form action={handleAddReview} className="flex gap-2">
          <input
            type="hidden"
            name="period_type"
            value={period}
          />
          <input
            type="hidden"
            name="period_start"
            value={start}
          />
          <input
            name="content"
            placeholder="Add a review note (accomplishments, talking points...)"
            className="flex-1 input-dark"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary whitespace-nowrap"
          >
            {isPending ? "Adding…" : "Add review"}
          </button>
        </form>
      </div>
      <div className="card-bg p-5 rounded-xl font-mono text-sm whitespace-pre-wrap text-slate-200" id="review-summary">
        <h3 className="font-semibold mb-2 text-white">My review notes</h3>
        {reviewEntries.length === 0 ? (
          <p className="text-slate-500 mb-4">No review notes yet. Add accomplishments or talking points above.</p>
        ) : (
          reviewEntries.map((r) => (
            <div key={r.id} className="mb-4 p-3 rounded bg-white/5 border border-slate-600">
              <p className="text-slate-200">{r.content}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
        <h3 className="font-semibold mt-6 mb-2 text-white">Daily plans</h3>
        {plans.length === 0 ? (
          <p className="text-slate-500">No plans in this period.</p>
        ) : (
          plans.map((p) => (
            <div key={p.date} className="mb-4">
              <p className="font-medium text-slate-300">{p.date}</p>
              {p.content && <pre className="mt-1 text-slate-200">{p.content}</pre>}
              {p.notes && <p className="mt-1 text-slate-400">Notes: {p.notes}</p>}
            </div>
          ))
        )}
        <h3 className="font-semibold mt-6 mb-2 text-white">Work log</h3>
        {workLogs.length === 0 ? (
          <p className="text-slate-500">No work log entries in this period.</p>
        ) : (
          workLogs.map((w) => (
            <div key={w.date + w.summary} className="mb-2 text-slate-200">
              <span className="text-slate-300">{w.date}</span> — {w.summary}
              {w.minutes != null && ` (${w.minutes} min)`}
            </div>
          ))
        )}
      </div>
      <p className="text-sm text-slate-400">
        Copy the content above to share with your manager for 1:1s or formal reviews.
      </p>
    </div>
  );
}
