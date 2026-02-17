"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileEditFormProps = {
  displayName: string | null;
  avatarUrl: string | null;
};

export default function ProfileEditForm({
  displayName,
  avatarUrl,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = e.currentTarget;
    const displayNameVal = (form.elements.namedItem("display_name") as HTMLInputElement).value.trim();
    const avatarUrlVal = (form.elements.namedItem("avatar_url") as HTMLInputElement).value.trim();

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          display_name: displayNameVal || null,
          avatar_url: avatarUrlVal || null,
        }),
      });

      let data: { error?: string; ok?: boolean };
      try {
        data = await res.json();
      } catch {
        setError(res.redirected ? "Session expired. Please sign in again." : "Invalid response from server.");
        return;
      }

      if (!res.ok) {
        setError(data.error || `Request failed (${res.status}).`);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded border border-emerald-500/50 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-400">Profile updated successfully.</p>
        </div>
      )}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-1">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName ?? ""}
          placeholder="Your name"
          className="w-full input-dark"
        />
      </div>
      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-300 mb-1">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="text"
          defaultValue={avatarUrl ?? ""}
          placeholder="https://..."
          className="w-full input-dark"
        />
        <p className="mt-1 text-xs text-slate-500">Paste a URL to your profile image.</p>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
