"use client";

import { useState, useTransition } from "react";
import { createCustomMilestone } from "./actions";

export default function AddMilestoneForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await createCustomMilestone(formData);
        setOpen(false);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add milestone.");
      }
    });
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Add custom milestone
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => { setOpen(false); setError(null); }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="card-bg p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Add custom milestone</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="custom_title" className="block text-sm font-medium text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    id="custom_title"
                    name="custom_title"
                    type="text"
                    required
                    placeholder="e.g. Launched new feature"
                    className="w-full input-dark"
                  />
                </div>
                <div>
                  <label htmlFor="custom_description" className="block text-sm font-medium text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="custom_description"
                    name="custom_description"
                    rows={3}
                    placeholder="Optional details..."
                    className="w-full input-dark"
                  />
                </div>
                <div>
                  <label htmlFor="earned_at" className="block text-sm font-medium text-slate-300 mb-1">
                    Date earned
                  </label>
                  <input
                    id="earned_at"
                    name="earned_at"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full input-dark"
                  />
                </div>
                <div>
                  <label htmlFor="credential_url" className="block text-sm font-medium text-slate-300 mb-1">
                    Credential URL
                  </label>
                  <input
                    id="credential_url"
                    name="credential_url"
                    type="url"
                    placeholder="https://..."
                    className="w-full input-dark"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isPending} className="btn-primary">
                    {isPending ? "Adding…" : "Add milestone"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setError(null); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
