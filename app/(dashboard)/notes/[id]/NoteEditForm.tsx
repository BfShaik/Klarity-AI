"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNote } from "../actions";

type Customer = { id: string; name: string };
type Note = { id: string; title: string; body: string | null; customer_id: string | null };

export default function NoteEditForm({
  note,
  customers,
}: {
  note: Note;
  customers: Customer[];
}) {
  const [body, setBody] = useState(note.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleRefine() {
    if (!body.trim()) return;
    setRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refine", text: body }),
      });
      const data = await res.json();
      if (res.ok && data.suggested != null) {
        setBody(data.suggested);
      } else {
        setRefineError(data.error || "Failed to refine note");
      }
    } catch {
      setRefineError("Network error. Please try again.");
    } finally {
      setRefining(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    const data = new FormData();
    data.set("title", formData.get("title") as string);
    data.set("body", body);
    data.set("customer_id", formData.get("customer_id") as string);
    startTransition(async () => {
      try {
        await updateNote(note.id, data);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save note.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4 max-w-xl">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4" role="alert">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4" role="status">
          <p className="text-sm text-emerald-400">Note saved.</p>
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={note.title}
          className="w-full input-dark"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-slate-300 mb-1">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full input-dark"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefine}
            disabled={refining || !body.trim()}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50"
          >
            {refining ? "Refining…" : "Refine with AI"}
          </button>
          {refineError && (
            <span className="text-sm text-red-400">{refineError}</span>
          )}
        </div>
      </div>
      {customers.length > 0 && (
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-slate-300 mb-1">
            Customer
          </label>
          <select
            id="customer_id"
            name="customer_id"
            defaultValue={note.customer_id ?? ""}
            className="w-full input-dark"
          >
            <option value="">— None —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
