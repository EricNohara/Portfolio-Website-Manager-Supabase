import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ICourse, ICourseInput } from "@/app/interfaces/ICourse";

const letterGrades = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
];
const otherGrades = ["P", "F"];
const percentageGrades = Array.from({ length: 101 }, (_, i) => i.toString());

const VALID_GRADES = [...letterGrades, ...otherGrades, ...percentageGrades];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const education_id = req.nextUrl.searchParams.get("educationID");
    const courseName = req.nextUrl.searchParams.get("courseName");

    if (education_id) {
      if (courseName) {
        const { data, error } = await supabase
          .from("course")
          .select()
          .eq("user_id", user.id)
          .eq("name", courseName)
          .eq("education_id", education_id);

        if (error) throw error;

        return NextResponse.json(data, { status: 200 });
      } else {
        const { data, error } = await supabase
          .from("course")
          .select()
          .eq("user_id", user.id)
          .eq("education_id", education_id);

        if (error) throw error;

        return NextResponse.json(data, { status: 200 });
      }
    } else {
      const { data, error } = await supabase
        .from("course")
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

    const sentData = await req.json();
    const sentCourse: ICourseInput = sentData.course;
    const sentEducationID = sentData.educationID;

    if (!sentCourse || !sentEducationID || !sentCourse.name)
      throw new Error("Missing data");

    if (sentCourse.grade && !VALID_GRADES.includes(sentCourse.grade)) {
      throw new Error("Invalid grade format");
    }

    const courseData = {
      ...sentCourse,
      user_id: user.id,
      education_id: sentEducationID,
    };

    const { error } = await supabase.from("course").insert(courseData);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully added course" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const educationID = req.nextUrl.searchParams.get("educationID");
  const courseName = req.nextUrl.searchParams.get("courseName");

  try {
    if (!educationID || !courseName) throw new Error("Invalid inputs");

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
      .from("course")
      .delete()
      .eq("education_id", educationID)
      .eq("name", courseName)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully deleted course" },
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
    const educationID = sentData.educationID;
    const courseName = sentData.courseName;
    const updatedCourse: ICourseInput = sentData.course;

    if (
      !updatedCourse ||
      !educationID ||
      !updatedCourse.name ||
      (updatedCourse.grade && !VALID_GRADES.includes(updatedCourse.grade))
    )
      throw new Error("Missing data");

    const courseData = {
      ...updatedCourse,
      user_id: user.id,
      education_id: educationID,
    };

    const { error } = await supabase
      .from("course")
      .update(courseData)
      .eq("education_id", educationID)
      .eq("name", courseName)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully updated course" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
