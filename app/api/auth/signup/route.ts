import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import IApiKey from "@/app/interfaces/IApiKey";
import { encrypt } from "@/utils/auth/encrypt";
import { generateAPIKey, hashKey } from "@/utils/auth/hash";

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
    const apiKey: string = await generateAPIKey(user.id, email);
    const hashedKey: string | null = await hashKey(apiKey);
    if (!hashedKey) throw new Error("Error generating private API key");

    const encryptedKey: string | null = encrypt(apiKey);
    if (!encryptedKey) throw new Error("Error encrypting private API key");

    const apiKeyData: IApiKey = {
      user_id: user.id,
      user_email: email,
      hashed_key: hashedKey,
      encrypted_key: encryptedKey,
    };

    const { error: keyError } = await supabase
      .from("api_keys")
      .insert(apiKeyData);

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
