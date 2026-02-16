"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkLogForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [minutes, setMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/work-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          summary,
          minutes: minutes ? parseInt(minutes, 10) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setSummary("");
        setMinutes("");
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || "Failed to save work log entry");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl p-5 card-bg text-slate-200">
      <h2 className="font-semibold">Add entry</h2>
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-400">Work log entry added successfully!</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="input-dark"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">What you did</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          placeholder="Short summary"
          className="w-full input-dark"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Minutes (optional)</label>
        <input
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="w-24 input-dark"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="btn-primary"
      >
        {saving ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
