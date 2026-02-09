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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl p-4 border rounded-lg bg-gray-50">
      <h2 className="font-semibold">Add entry</h2>
      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-600">Work log entry added successfully!</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What you did</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          placeholder="Short summary"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minutes (optional)</label>
        <input
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="w-24 rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
