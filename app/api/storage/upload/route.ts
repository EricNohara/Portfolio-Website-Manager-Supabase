import { createServerClient } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const serverSupabase = await createServerClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "User not signed in." },
      { status: 404 }
    );
  }

  try {
    const bucketName = req.headers.get("bucket-name") as string;
    const contentType = req.headers.get("content-type") as string;
    const fileName = req.headers.get("file-name") as string;

    if (!bucketName || !contentType || !fileName) {
      return NextResponse.json(
        { message: "More information required" },
        { status: 400 }
      );
    }

    const reader = req.body?.getReader();
    const chunks: Uint8Array[] = [];

    if (!reader) {
      return NextResponse.json(
        { message: "Failed to get request body reader" },
        { status: 400 }
      );
    }

    // Read the stream
    let done = false;
    while (!done) {
      const { value, done: isDone } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = isDone;
    }

    const buffer = Buffer.concat(chunks);

    // Upload to Supabase Storage
    const { error } = await serverSupabase.storage
      .from(bucketName)
      .upload(`${fileName}`, buffer, {
        contentType: contentType,
      });

    if (error) {
      console.error(error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "File uploaded successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "File upload failed" },
      { status: 500 }
    );
  }
}
