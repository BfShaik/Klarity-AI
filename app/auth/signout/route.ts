import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const redirectUrl = new URL("/login", request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl, 302);
}
