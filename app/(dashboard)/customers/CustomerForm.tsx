"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "./actions";

export default function CustomerForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await createCustomer(formData);
        setSuccess(true);
        const form = document.getElementById("customer-form") as HTMLFormElement;
        form?.reset();
        router.refresh(); // Refresh list so new customer appears
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : "Could not save. Please try again.";
        setError(message);
      }
    });
  }

  return (
    <form id="customer-form" action={handleSubmit} className="mb-8 p-5 card-bg max-w-md space-y-3">
      <h2 className="font-semibold text-white">Add customer</h2>
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4" role="alert">
          <p className="font-medium text-red-400">Could not save</p>
          <p className="mt-1 text-sm text-red-300/90">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4" role="status">
          <p className="font-medium text-emerald-400">Saved</p>
          <p className="mt-1 text-sm text-emerald-300/90">Customer was added successfully. You can add another below.</p>
        </div>
      )}
      <input name="name" required placeholder="Customer name" className="w-full input-dark" />
      <textarea name="notes" placeholder="Notes (optional)" rows={2} className="w-full input-dark" />
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Adding…" : "Add customer"}
      </button>
    </form>
  );
}
