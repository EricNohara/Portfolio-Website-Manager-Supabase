import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}
