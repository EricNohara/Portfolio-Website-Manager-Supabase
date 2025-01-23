import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import IApiKey from "@/app/interfaces/IApiKey";
import bcrypt from "bcrypt";
import { encrypt } from "@/utils/auth/encrypt";

const saltRounds = 10;

async function generateAPIKey(
  user_id: string,
  email: string,
  password: string
) {
  const key = `${user_id}-${Date.now()}-${email}-${password}`;
  const hash = await bcrypt.hash(key, saltRounds);
  return hash;
}

async function hashKey(key: string) {
  const hash = await bcrypt.hash(key, saltRounds);
  return hash;
}

// route to add user to the auth table and generate, encrypt, and store a private API key for the user
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { email, password }: { email: string; password: string } =
      await req.json();

    if (!email || !password) {
      throw new Error("Email or password missing");
    }

    const data = {
      email: email,
      password: password,
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      throw error;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Error generating user private API key - user not signed in"
      );
    }

    // generate and store private API key
    const api_key: string = await generateAPIKey(user.id, email, password);
    const hashed_api_key: string = await hashKey(api_key);
    const encrypted_api_key: string = encrypt(api_key);

    const api_key_data: IApiKey = {
      user_id: user.id,
      hashed_key: hashed_api_key,
      encrypted_key: encrypted_api_key,
    };

    const { error: keyError } = await supabase
      .from("api_keys")
      .insert(api_key_data);

    if (keyError) throw new Error("Error generating user private API key");

    return NextResponse.json(
      { message: "Sign up successful" },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(err);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
