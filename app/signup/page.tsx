"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Check your email for the confirmation link.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 page-bg">
      <div className="w-full max-w-sm space-y-6 card-bg p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-center text-white">Klarity AI</h1>
        <p className="text-center text-slate-400">Create your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/50 p-2 rounded-lg">{error}</p>}
          {message && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/50 p-2 rounded-lg">{message}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full input-dark" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full input-dark" />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-red-400 hover:text-red-300">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
