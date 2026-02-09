"use client";

import { useState, useTransition } from "react";
import { createCustomer } from "./actions";

export default function CustomerForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await createCustomer(formData);
        setSuccess(true);
        // Reset form
        const form = document.getElementById("customer-form") as HTMLFormElement;
        form?.reset();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create customer");
      }
    });
  }

  return (
    <form id="customer-form" action={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50 max-w-md space-y-3">
      <h2 className="font-semibold">Add customer</h2>
      {error && (
        <div className="rounded bg-red-50 border border-red-200 p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 p-2">
          <p className="text-sm text-green-600">Customer added successfully!</p>
        </div>
      )}
      <input
        name="name"
        required
        placeholder="Customer name"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={2}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add customer"}
      </button>
    </form>
  );
}
