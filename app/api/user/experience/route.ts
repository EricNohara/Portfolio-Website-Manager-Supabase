import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IExperience, IUserExperience } from "@/app/interfaces/IExperience";

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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const sentExperienceData: IExperience = await req.json();

    if (!sentExperienceData) throw new Error("No data provided");

    if (!sentExperienceData.company || !sentExperienceData.job_title)
      throw new Error("Invalid data");

    const experienceData: IUserExperience = {
      ...sentExperienceData,
      user_id: user.id,
    };

    const { error } = await supabase
      .from("work_experiences")
      .insert(experienceData);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully added work experience" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
