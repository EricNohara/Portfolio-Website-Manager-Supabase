import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { email, password }: { email: string; password: string } =
      await req.json();

    if (!email || !password) {
      throw new Error("Email or password missing");
    }

    const data = { email: email, password: password };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return NextResponse.json(
        { message: "Email or password incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "Log in successful" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
}
