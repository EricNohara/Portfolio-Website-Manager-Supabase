import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ISkills, ISkillsInput } from "@/app/interfaces/ISkills";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const skillName = req.nextUrl.searchParams.get("skillName");

    if (skillName) {
      const { data, error } = await supabase
        .from("skills")
        .select()
        .eq("user_id", user.id)
        .eq("name", skillName);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("skills")
        .select()
        .eq("user_id", user.id);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    }
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

    const sentSkill: ISkillsInput = await req.json();

    if (!sentSkill || !sentSkill.name) throw new Error("Missing data");

    if (
      sentSkill.years_of_experience &&
      (sentSkill.years_of_experience < 0 || sentSkill.years_of_experience > 100)
    ) {
      throw new Error("Invalid value for years of experience");
    }

    if (
      sentSkill.proficiency &&
      (sentSkill.proficiency < 0 || sentSkill.proficiency > 10)
    ) {
      throw new Error("Invalid value for skill proficiency");
    }

    const skillData: ISkills = {
      ...sentSkill,
      user_id: user.id,
    };

    const { error } = await supabase.from("skills").insert(skillData);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully added skill" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const skillName = req.nextUrl.searchParams.get("skillName");

  try {
    if (!skillName) throw new Error("Invalid inputs");

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "User not signed in." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("name", skillName)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully deleted skill" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const sentData = await req.json();
    const skillName = sentData.skillName;
    const updatedSkill: ISkillsInput = sentData.updatedSkill;

    if (!updatedSkill || !skillName || !updatedSkill.name)
      throw new Error("Missing data");

    if (
      updatedSkill.years_of_experience &&
      (updatedSkill.years_of_experience < 0 ||
        updatedSkill.years_of_experience > 100)
    )
      throw new Error("Invalid years of experience value");

    if (
      updatedSkill.proficiency &&
      (updatedSkill.proficiency < 0 || updatedSkill.proficiency > 10)
    )
      throw new Error("Invalid proficiency value");

    const skillData: ISkills = {
      ...updatedSkill,
      user_id: user.id,
    };

    const { error } = await supabase
      .from("skills")
      .update(skillData)
      .eq("name", skillName)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully updated skill" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
