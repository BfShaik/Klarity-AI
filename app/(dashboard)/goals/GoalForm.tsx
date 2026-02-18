"use client";

import { useState, useTransition } from "react";
import { createGoal } from "./actions";

type Certification = { id: string; name: string };

export default function GoalForm({ certifications }: { certifications: Certification[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await createGoal(formData);
        setSuccess(true);
        // Reset form
        const form = document.getElementById("goal-form") as HTMLFormElement;
        form?.reset();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create goal");
      }
    });
  }

  return (
    <form id="goal-form" action={handleSubmit} className="mb-8 p-5 card-bg max-w-md space-y-3 text-slate-200">
      <h2 className="font-semibold">Add goal</h2>
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-2">
          <p className="text-sm text-emerald-400">Goal added successfully!</p>
        </div>
      )}
      <input
        name="title"
        required
        placeholder="Goal title"
        className="w-full input-dark"
      />
      <input
        name="target_date"
        type="date"
        placeholder="Target date"
        className="w-full input-dark"
      />
      {certifications.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Link to certification (optional)</label>
          <select name="linked_certification_id" className="w-full input-dark">
            <option value="">— None —</option>
            {certifications.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      <button 
        type="submit" 
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? "Adding…" : "Add goal"}
      </button>
    </form>
  );
}
