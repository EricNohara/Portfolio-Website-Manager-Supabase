import { createClient, createServiceRoleClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import IUser from "@/app/interfaces/IUser";
import { IProject } from "@/app/interfaces/IProject";
import parseURL from "@/utils/general/parseURL";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error, status } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single();

    if (error && status !== 406) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData: IUser = {
      email: data.email,
      name: data.name,
      phone_number: data.phone_number,
      location: data.location,
      github_url: data.github_url,
      linkedin_url: data.linkedin_url,
      portrait_url: data.portrait_url,
      resume_url: data.resume_url,
      transcript_url: data.transcript_url,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      bio: data.bio,
      current_position: data.current_position,
    };

    return NextResponse.json({ userData: userData }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userData: IUser = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user?.id);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { messgae: "User successfully created" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(err);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userData = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user?.id);

    if (error) throw error;

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error updating user information" },
      { status: 400 }
    );
  }
}

// user only able to delete its own account and only if it is logged in
export async function DELETE(_req: NextRequest) {
  const serviceRoleSupabase = createServiceRoleClient();

  try {
    //   Check if a user's logged in
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

    // delete all items in storage associated with the user
    const publicURLs = [];

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select()
      .eq("user_id", user.id);

    console.log(projectError);

    if (projectError) throw new Error(projectError.message);

    projectData?.forEach((project: IProject) => {
      if (project.thumbnail_url && project.thumbnail_url !== "") {
        publicURLs.push(project.thumbnail_url);
      }
    });

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single();

    if (userError) throw new Error(userError.message);

    if (userData.portrait_url && userData.portrait_url !== null)
      publicURLs.push(userData.portrait_url);
    if (userData.resume_url && userData.resume_url !== null)
      publicURLs.push(userData.resume_url);
    if (userData.transcript_url && userData.transcript_url !== null)
      publicURLs.push(userData.transcript_url);

    publicURLs.forEach(async (url: string) => {
      if (!url || url === "") return;

      const { parsedBucket, parsedFilename } = parseURL(url);

      const { error } = await serviceRoleSupabase.storage
        .from(parsedBucket)
        .remove([parsedFilename]);

      if (error) throw error;
    });

    // delete the user from the auth table - this will cause cascading deletions from all other tables
    const { error } = await serviceRoleSupabase.auth.admin.deleteUser(user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { message: "User successfully deleted" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(err);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
