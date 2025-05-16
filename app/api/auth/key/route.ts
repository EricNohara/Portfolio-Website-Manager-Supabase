import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateAPIKey, hashKey } from "@/utils/auth/hash";
import { encrypt } from "@/utils/auth/encrypt";
import IApiKey from "@/app/interfaces/IApiKey";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const getUserEmail: boolean =
      req.nextUrl.searchParams.get("getUserEmail") === "true" ? true : false;

    if (getUserEmail) {
      const { data, error } = await supabase
        .from("api_keys")
        .select("encrypted_key, user_email")
        .eq("user_id", user.id);

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("encrypted_key")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // deleting old key if it exists
    await supabase.from("api_keys").delete().eq("user_id", user.id);

    // generating the new key
    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id);

    if (error) throw error;

    const email = data[0].email;

    const apiKey = await generateAPIKey(user.id, email);

    const hashedKey: string | null = await hashKey(apiKey);
    if (!hashedKey) throw new Error("Error hashing api key");

    const valid = await bcrypt.compare(apiKey, hashedKey);

    console.log(`Key: ${apiKey}, hashedKey1: ${valid}`);

    const encryptedKey: string | null = encrypt(apiKey);
    if (!encryptedKey) throw new Error("Error encrypting api key");

    const keyData: IApiKey = {
      user_id: user.id,
      user_email: email,
      hashed_key: hashedKey,
      encrypted_key: encryptedKey,
    };

    const { error: keyError } = await supabase.from("api_keys").insert(keyData);

    if (keyError) throw new Error("Error generating user private API key");

    return NextResponse.json({ encrypted_key: encryptedKey }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
