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

    const data = { email, password };

    const { error } = await supabase.auth.signUp(data);
    if (error) throw error;

    return NextResponse.json(
      { message: "Sign up successful" },
      { status: 201 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
