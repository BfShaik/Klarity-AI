"use client";

import { useState } from "react";

export default function ServiceUnavailablePage() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; hints?: string[] } | null>(null);

  async function handleCheck() {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Could not run health check" });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-bg">
      <div className="max-w-md w-full">
        <h1 className="text-xl font-semibold text-white text-center">Service temporarily unavailable</h1>
        <p className="mt-2 text-slate-400 text-center">
          The app cannot reach Supabase. Common causes:
        </p>
        <ul className="mt-3 text-sm text-slate-400 space-y-1 list-disc list-inside">
          <li>No internet or unstable connection</li>
          <li>VPN or firewall blocking supabase.co</li>
          <li>Supabase project paused (free tier: restore at supabase.com/dashboard)</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            {checking ? "Checking…" : "Check connection"}
          </button>
          {result && (
            <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-3 text-left text-sm">
              {result.ok ? (
                <p className="text-emerald-400">Supabase is reachable. Try again.</p>
              ) : (
                <>
                  <p className="text-red-400 font-medium">{result.error}</p>
                  {result.hints?.length && (
                    <ul className="mt-2 text-slate-400 space-y-1">
                      {result.hints.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
          <a href="/" className="btn-primary text-center">
            Try again
          </a>
        </div>
      </div>
    </div>
  );
}
