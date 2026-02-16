"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePlan } from "./actions";

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
  const [isDeleting, startDeleteTransition] = useTransition();
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
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-400">Plan saved successfully!</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Plan items (one per line)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full input-dark"
          placeholder="e.g. Call with Customer X&#10;Finish migration doc"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full input-dark"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save plan"}
        </button>
        {planId && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (!confirm("Clear today's plan?")) return;
              startDeleteTransition(async () => {
                await deletePlan(planId);
                setContent("");
                setNotes("");
                router.refresh();
              });
            }}
            className="btn-danger"
          >
            {isDeleting ? "…" : "Clear plan"}
          </button>
        )}
      </div>
    </form>
  );
}
