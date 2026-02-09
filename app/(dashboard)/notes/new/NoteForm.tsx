"use client";

import { useState } from "react";
import VoiceRecorder from "@/components/voice/VoiceRecorder";

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

  return (
    <form action={action} className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <VoiceRecorder onTranscript={(text) => setBody((prev) => (prev ? prev + "\n\n" + text : text))} />
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefine}
            disabled={refining || !body.trim()}
            className="text-sm rounded bg-gray-200 text-gray-700 px-3 py-1.5 hover:bg-gray-300 disabled:opacity-50"
          >
            {refining ? "Refining…" : "Refine with AI"}
          </button>
          {refineError && (
            <span className="text-sm text-red-600">{refineError}</span>
          )}
        </div>
      </div>
      {customers.length > 0 && (
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            id="customer_id"
            name="customer_id"
            className="w-full rounded border border-gray-300 px-3 py-2"
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
        className="rounded bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700"
      >
        Save note
      </button>
    </form>
  );
}
