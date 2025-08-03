import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      ),
    };
  }
  return { user, supabase };
}
