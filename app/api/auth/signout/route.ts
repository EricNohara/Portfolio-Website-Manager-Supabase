import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/user/login", req.url), {
    status: 302,
  });
}
