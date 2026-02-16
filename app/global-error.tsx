"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#1a1b2c", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>A critical error occurred. Please try again or refresh the page.</p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => reset()} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "white", background: "#ef4444", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
              Try again
            </button>
            <a href="/" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "#f8fafc", background: "#282a3a", border: "1px solid #334155", borderRadius: "0.5rem", textDecoration: "none" }}>
              Go to dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
