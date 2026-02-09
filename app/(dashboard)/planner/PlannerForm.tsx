"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlannerForm({
  date,
  initialContent,
  initialNotes,
  planId,
}: {
  date: string;
  initialContent: string;
  initialNotes: string;
  planId?: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [notes, setNotes] = useState(initialNotes);
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
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, content, notes, planId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to save plan");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-600">Plan saved successfully!</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan items (one per line)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="e.g. Call with Customer X&#10;Finish migration doc"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save plan"}
      </button>
    </form>
  );
}
