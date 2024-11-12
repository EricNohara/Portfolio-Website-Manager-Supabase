import { createServerClient } from "@/utils/supabase/client";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const serverSupabase = await createServerClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await serverSupabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Failed to delete user:", error.message);
      return NextResponse.json(
        { message: "Failed to delete user." },
        { status: 500 }
      );
    } else {
      revalidatePath("/", "layout");
      return NextResponse.redirect(new URL("/user/login", req.url), {
        status: 302,
      });
    }
  }

  return NextResponse.json({ message: "User not signed in." }, { status: 404 });
}
