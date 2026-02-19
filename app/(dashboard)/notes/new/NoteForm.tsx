"use client";

import { useState, useTransition } from "react";
import VoiceRecorder from "@/components/voice/VoiceRecorder";

// Voice recording on hold; set to true to re-enable
const VOICE_RECORDING_ENABLED = false;

type Customer = { id: string; name: string };

export default function NoteForm({
  customers,
  action,
}: {
  customers: Customer[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    } catch (err) {
      setRefineError("Network error. Please try again.");
    } finally {
      setRefining(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSubmitError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Could not save note. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-xl">
      {submitError && (
        <div className="rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4" role="alert">
          <p className="font-medium text-red-400">Could not save</p>
          <p className="mt-1 text-sm text-red-300">{submitError}</p>
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
          className="w-full input-dark"
        />
      </div>
      {VOICE_RECORDING_ENABLED && (
        <VoiceRecorder onTranscript={(text) => setBody((prev) => (prev ? prev + "\n\n" + text : text))} />
      )}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-slate-300 mb-1">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
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
        {isPending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}
