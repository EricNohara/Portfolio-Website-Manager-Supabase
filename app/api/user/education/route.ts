import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IEducation, IEducationInput } from "@/app/interfaces/IEducation";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("education")
        .select()
        .eq("user_id", user.id)
        .eq("id", id);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("education")
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

    const sentEducation: IEducationInput = await req.json();

    if (!sentEducation) throw new Error("No data provided");

    if (sentEducation.gpa && sentEducation.gpa > 4) {
      throw new Error("GPA cannot be greater than 4.000");
    }

    if (!sentEducation.institution || !sentEducation.degree)
      throw new Error("Invalid data");

    const experienceData = {
      ...sentEducation,
      user_id: user.id,
    };

    const { error } = await supabase.from("education").insert(experienceData);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully added education" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (!id) throw new Error("Invalid inputs");

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
      .from("education")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully deleted education" },
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

    const {
      id,
      updatedEducation,
    }: {
      id: string;
      updatedEducation: IEducationInput;
    } = await req.json();

    if (!updatedEducation) throw new Error("Missing data");

    if (!id || !updatedEducation.institution || !updatedEducation.degree)
      throw new Error("Invalid data");

    const educationData = {
      ...updatedEducation,
      user_id: user.id,
    };

    const { error } = await supabase
      .from("education")
      .update(educationData)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully updated education" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
