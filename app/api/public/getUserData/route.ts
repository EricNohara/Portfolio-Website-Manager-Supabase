import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/auth/encrypt";
import { validateKey } from "@/utils/auth/hash";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // get the api key from the authorization header
    const apiKey = req.headers.get("Authorization")?.split(" ")[1];
    const userEmail = req.headers.get("User-Email");

    if (!apiKey)
      throw new Error("Requested data requires a valid private API key");

    if (!userEmail)
      throw new Error("Requested data requires a valid user email");

    // decrypt the api key
    const decryptedKey = decrypt(apiKey);
    if (!decryptedKey) throw new Error("Invalid private API key");

    // retrieve the hashed passkey
    const { data, error } = await supabase
      .from("api_keys")
      .select("hashed_key, user_id")
      .eq("user_email", userEmail);

    if (error) throw error;

    if (!data) throw new Error("Inputted email has no private API key");

    // validate user's key
    const isValid = await validateKey(decryptedKey, data[0].hashed_key);

    if (!isValid) throw new Error("Invalid private API key");

    return NextResponse.json(
      { message: `User validated: ${data[0].user_id}` },
      { status: 200 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
