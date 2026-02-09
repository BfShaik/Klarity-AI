"use client";

import { useState, useTransition } from "react";
import { createGoal } from "./actions";

export default function GoalForm() {
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
    <form id="goal-form" action={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50 max-w-md space-y-3">
      <h2 className="font-semibold">Add goal</h2>
      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 p-2">
          <p className="text-sm text-green-600">Goal added successfully!</p>
        </div>
      )}
      <input
        name="title"
        required
        placeholder="Goal title"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <input
        name="target_date"
        type="date"
        placeholder="Target date"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add goal"}
      </button>
    </form>
  );
}
