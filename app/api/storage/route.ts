import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle multipart form data manually
  },
};

function parseURL(url: string) {
  const splitURL = url.split("/");
  const parsedBucket = splitURL[splitURL.length - 2];
  const encodedName = splitURL[splitURL.length - 1];
  const parsedFilename = decodeURIComponent(encodedName);
  return { parsedBucket, parsedFilename };
}

export async function POST(req: NextRequest) {
  const serviceRoleSupabase = createServiceRoleClient();

  try {
    const supabase = await createClient();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucketName = formData.get("bucketName") as string | null;

    if (!file || !bucketName) {
      throw new Error("Invalid upload arguments");
    }

    // Check if a user's logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // upload to supabase
    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);
    const filepath =
      bucketName === "project_thumbnails"
        ? `${user.id}-${Date.now()}-${file.name}`
        : `${user.id}-${file.name}`;

    const { error: uploadError } = await serviceRoleSupabase.storage
      .from(bucketName)
      .upload(filepath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    // get the public URL
    const { data: publicURL } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filepath);

    if (bucketName !== "project_thumbnails") {
      let documentField: string;
      let updateData;
      if (bucketName === "portraits") {
        documentField = "portrait_url";
        updateData = { portrait_url: publicURL.publicUrl };
      } else if (bucketName === "resumes") {
        documentField = "resume_url";
        updateData = { resume_url: publicURL.publicUrl };
      } else {
        documentField = "transcript_url";
        updateData = { transcript_url: publicURL.publicUrl };
      }

      // check if user already has a document - if so delete the document and its reference
      const { data: userData, error: existsError } = await supabase
        .from("users")
        .select(documentField)
        .eq("id", user.id);

      if (existsError) {
        // if error checking if url exists, delete from storage
        await serviceRoleSupabase.storage.from(bucketName).remove([file.name]);
        throw existsError;
      }

      const existingURL = Object.values(userData)[0] as string;

      // add it to the user's row
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user?.id);

      if (updateError) {
        await serviceRoleSupabase.storage.from(bucketName).remove([file.name]);
        throw updateError;
      }

      // delete old document after the new doc successfully saves
      if (existingURL !== "") {
        // user already has a document so need to delete it
        const { parsedBucket, parsedFilename } = parseURL(
          Object.values(existingURL)[0]
        );
        await serviceRoleSupabase.storage
          .from(parsedBucket)
          .remove([parsedFilename]);
      }

      return NextResponse.json(
        { message: "Upload successful" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { publicURL: publicURL.publicUrl },
        { status: 200 }
      );
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const serviceRoleSupabase = createServiceRoleClient();
  const publicURL: string | null = req.nextUrl.searchParams.get("publicURL");

  try {
    if (!publicURL) {
      throw new Error("Missing public url to delete");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { parsedBucket, parsedFilename } = parseURL(publicURL);

    // try to delete from DB
    const userData =
      parsedBucket === "portraits"
        ? { portrait_url: "" }
        : parsedBucket === "resumes"
        ? { resume_url: "" }
        : { transcript_url: "" };

    const { error: updateError } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user?.id);

    if (updateError) {
      throw updateError;
    }

    const { error } = await serviceRoleSupabase.storage
      .from(parsedBucket)
      .remove([parsedFilename]);

    if (error) throw error;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
