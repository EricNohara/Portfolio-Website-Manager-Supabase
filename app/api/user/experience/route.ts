import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import IExperience from "@/app/interfaces/IExperience";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("work_experiences")
      .select()
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
}
