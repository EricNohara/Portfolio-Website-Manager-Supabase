import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json().catch(() => null);
  const email =
    body && typeof body === "object"
      ? (body as { email?: unknown }).email
      : undefined;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: `${req.nextUrl.origin}/api/internal/auth/callback?next=/user`,
      },
    });

    if (error) {
      console.error("Unable to resend confirmation email:", error.message);
    }
  } catch (error) {
    console.error("Unable to resend confirmation email:", error);
  }

  // Keep this response neutral so the endpoint does not reveal account state.
  return NextResponse.json({
    message: "If an unconfirmed account exists for this email, we sent a new confirmation link.",
  });
}
