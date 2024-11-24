import { createClient } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    const userID = req.nextUrl.searchParams.get("id"); // ?id=<user id>

    const { data, error, status } = await supabase
      .from("users")
      .select()
      .eq("id", userID)
      .single();

    if (error && status !== 406) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = {
      email: data.email,
      name: data.name,
      phone_number: data.phone_number,
      location: data.location,
      github_url: data.github_url,
      linkedin_url: data.linkedin_url,
      portrait_url: data.portrait_url,
      resume_url: data.resume_url,
      transcript_url: data.transcript_url,
    };

    return NextResponse.json({ userData: userData }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
}
