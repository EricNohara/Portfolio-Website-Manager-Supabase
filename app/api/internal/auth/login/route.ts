import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { email, password }: { email: string; password: string } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email or password missing" },
        { status: 400 }
      );
    }

    const data = { email: email, password: password };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Log in successful" }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
