import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type GetAuthenticatedUserOptions = {
  allowPendingDeletion?: boolean;
};

export async function getAuthenticatedUser(
  options: GetAuthenticatedUserOptions = {},
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      ),
    };
  }

  if (!options.allowPendingDeletion) {
    const { data: deletionLock, error: deletionLockError } = await supabase
      .from("account_deletion_locks")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (deletionLockError) {
      console.error("Unable to check account deletion status:", deletionLockError);
      return {
        user: null,
        response: NextResponse.json(
          { message: "Unable to verify account status" },
          { status: 500 },
        ),
      };
    }

    if (deletionLock) {
      return {
        user: null,
        response: NextResponse.json(
          { message: "Account deletion is in progress" },
          { status: 423 },
        ),
      };
    }
  }

  return { user, supabase };
}
