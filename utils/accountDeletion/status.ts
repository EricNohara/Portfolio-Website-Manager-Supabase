import "server-only";

import { createAdminClient } from "@/utils/supabase/server";

export async function isAccountDeletionPending(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("account_deletion_locks")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to check account deletion status: ${error.message}`);
  }

  return Boolean(data);
}

export async function isAccountActive(userId: string) {
  const admin = createAdminClient();
  const [authResult, lockResult] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from("account_deletion_locks")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (authResult.error && authResult.error.status !== 404) {
    throw new Error(`Unable to verify Auth user: ${authResult.error.message}`);
  }

  if (lockResult.error) {
    throw new Error(
      `Unable to check account deletion status: ${lockResult.error.message}`,
    );
  }

  return Boolean(authResult.data.user) && !lockResult.data;
}
