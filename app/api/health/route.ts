import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    }, { status: 503 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: { apikey: key },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok || res.status === 404) {
      return NextResponse.json({ ok: true, message: "Supabase is reachable" });
    }
    return NextResponse.json({
      ok: false,
      error: `Supabase returned ${res.status}`,
      status: res.status,
    }, { status: 503 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = e instanceof Error && e.cause ? String(e.cause) : "";
    return NextResponse.json({
      ok: false,
      error: "Cannot reach Supabase",
      details: `${msg} ${cause}`.trim(),
      hints: [
        "Check your internet connection",
        "If using VPN, try disabling it or switching regions",
        "Supabase free-tier projects pause after 7 days — restore at supabase.com/dashboard",
        "Corporate firewall may block *.supabase.co",
      ],
    }, { status: 503 });
  }
}
