import { NextRequest, NextResponse } from "next/server";

import IApiKey from "@/app/interfaces/IApiKey";
import { encrypt } from "@/utils/auth/encrypt";
import { generateAPIKey, hashKey } from "@/utils/auth/hash";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { email, password }: { email: string; password: string } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email or password missing" },
        { status: 400 }
      );
    }

    const data = { email, password };

    const { error } = await supabase.auth.signUp(data);
    if (error) throw error;

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
      { status: 201 }
    );
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
