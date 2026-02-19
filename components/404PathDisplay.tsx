"use client";

import { useEffect, useState } from "react";

export function NotFoundPathDisplay() {
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => {
    setPath(typeof window !== "undefined" ? window.location.pathname : null);
  }, []);
  if (!path) return null;
  return (
    <p className="mt-2 text-xs text-slate-500 break-all">
      Path: <code>{path}</code>
    </p>
  );
}
