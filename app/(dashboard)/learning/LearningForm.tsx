"use client";

import { useState, useTransition } from "react";
import { createLearningItem } from "./actions";

export default function LearningForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await createLearningItem(formData);
        setSuccess(true);
        // Reset form
        const form = document.getElementById("learning-form") as HTMLFormElement;
        form?.reset();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create learning item");
      }
    });
  }

  return (
    <form id="learning-form" action={handleSubmit} className="mb-8 p-5 card-bg max-w-md space-y-3 text-slate-200">
      <h2 className="font-semibold">Add learning item</h2>
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-2">
          <p className="text-sm text-emerald-400">Learning item added successfully!</p>
        </div>
      )}
      <input
        name="title"
        required
        placeholder="Title"
        className="w-full input-dark"
      />
      <input
        name="source"
        required
        placeholder="Source (e.g. Oracle Learning, YouTube)"
        className="w-full input-dark"
      />
      <input
        name="external_url"
        type="url"
        placeholder="URL (optional)"
        className="w-full input-dark"
      />
      <input
        name="progress_percent"
        type="number"
        min={0}
        max={100}
        defaultValue={0}
        placeholder="Progress %"
        className="w-24 input-dark"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
