import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle multipart form data manually
  },
};

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

    const { error } = await serviceRoleSupabase.storage
      .from(bucketName)
      .upload(`${user.id}-${file.name}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // return the public URL
    const { data } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(`${file.name}`);

    return NextResponse.json({ url: data.publicUrl }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const serviceRoleSupabase = createServiceRoleClient();

  try {
    const bucket: string | null = req.nextUrl.searchParams.get("bucket");
    const filename: string | null = req.nextUrl.searchParams.get("filename");

    if (!bucket || !filename) {
      throw new Error("Bucket or filename required");
    }

    const { error } = await serviceRoleSupabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) throw error;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err }, { status: 400 });
  }
}
