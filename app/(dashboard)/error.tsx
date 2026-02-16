"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "#202130" }}>
      <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>An error occurred in this section. You can try again or go back to the dashboard.</p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button type="button" onClick={() => reset()} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "white", background: "#ef4444", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
            Try again
          </button>
          <a href="/" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#f8fafc", background: "#282a3a", border: "1px solid #334155", borderRadius: "0.5rem", textDecoration: "none" }}>
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
