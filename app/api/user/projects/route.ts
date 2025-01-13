import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IProject, IProjectInput } from "@/app/interfaces/IProject";
import { useDateField } from "@mui/x-date-pickers/DateField/useDateField";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const limit = req.nextUrl.searchParams.get("limit");
    const projectID = req.nextUrl.searchParams.get("projectID");

    if (limit && projectID)
      throw new Error("Limit and projectID cannot both be specified");

    if (limit) {
      const limitNum = parseInt(limit);

      if (limitNum <= 0)
        throw new Error("Limit parameter must be greater than 0");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .limit(limitNum);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    }

    if (projectID) {
      const { data, error } = await supabase
        .from("projects")
        .select()
        .eq("user_id", user.id)
        .eq("id", projectID);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    }

    const { data, error } = await supabase
      .from("projects")
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

    const sentProject: IProjectInput = await req.json();

    if (!sentProject || !sentProject.name || !sentProject.description)
      throw new Error("Invalid data provided");

    const projectData = {
      ...sentProject,
      user_id: user.id,
    };

    const { error } = await supabase.from("projects").insert(projectData);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully added project" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const projectID = req.nextUrl.searchParams.get("projectID");

  try {
    if (!projectID) throw new Error("Invalid input");

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
      .from("projects")
      .delete()
      .eq("id", projectID)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully deleted project" },
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
      prevProject,
      updatedProject,
    }: {
      prevProject: string;
      updatedProject: IProjectInput;
    } = await req.json();

    if (
      !updatedProject ||
      !prevProject ||
      !updatedProject.name ||
      !updatedProject.description
    )
      throw new Error("Missing data");

    const projectData = {
      ...updatedProject,
      user_id: user.id,
    };

    const { error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", prevProject)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Successfully updated project" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
