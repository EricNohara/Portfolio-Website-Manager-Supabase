import "server-only";

import parseURL, {
  isStorageObjectOwnedByUser,
} from "@/utils/general/parseURL";
import { stripe } from "@/utils/stripe/stripe";
import { createAdminClient } from "@/utils/supabase/server";

import type { SupabaseClient } from "@supabase/supabase-js";

const LIST_PAGE_SIZE = 1000;
const REMOVE_BATCH_SIZE = 1000;

type StorageObject = {
  bucket: string;
  path: string;
};

type AccountResources = {
  stripeCustomerId: string | null;
  storageObjects: StorageObject[];
};

function isMissingBucketError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}

function isSafeStoragePath(path: string) {
  if (!path || path.startsWith("/") || path.includes("\\") || path.includes("\0")) {
    return false;
  }

  return path.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

function isFileWithinFolder(path: string, folder: string) {
  return isSafeStoragePath(path) && path.startsWith(`${folder}/`) && path.length > folder.length + 1;
}

function addStorageObject(
  objects: Map<string, StorageObject>,
  bucket: string,
  path: string,
) {
  if (!isSafeStoragePath(path)) return;
  objects.set(`${bucket}\0${path}`, { bucket, path });
}

function addPublicUrlIfOwned(
  objects: Map<string, StorageObject>,
  url: string | null | undefined,
  expectedBucket: string,
  ownsPath: (path: string) => boolean,
) {
  if (!url) return;
  const parsed = parseURL(url);
  if (
    !parsed ||
    parsed.parsedBucket !== expectedBucket ||
    !ownsPath(parsed.parsedFilename)
  ) {
    return;
  }

  addStorageObject(objects, parsed.parsedBucket, parsed.parsedFilename);
}

async function listFlatUserObjects(bucket: string, userId: string) {
  const admin = createAdminClient();
  const objects: StorageObject[] = [];
  const ownerPrefix = `${userId}-`;
  let offset = 0;

  while (true) {
    const { data, error } = await admin.storage.from(bucket).list("", {
      limit: LIST_PAGE_SIZE,
      offset,
      search: ownerPrefix,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      if (isMissingBucketError(error)) return objects;
      throw new Error(`Unable to list ${bucket} objects: ${error.message}`);
    }

    for (const object of data ?? []) {
      if (object.id && isStorageObjectOwnedByUser(object.name, userId)) {
        objects.push({ bucket, path: object.name });
      }
    }

    if (!data || data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }

  return objects;
}

async function listFolderObjects(bucket: string, folder: string): Promise<StorageObject[]> {
  const admin = createAdminClient();
  const objects: StorageObject[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await admin.storage.from(bucket).list(folder, {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      if (isMissingBucketError(error)) return objects;
      throw new Error(`Unable to list ${bucket}/${folder}: ${error.message}`);
    }

    for (const object of data ?? []) {
      const path = `${folder}/${object.name}`;
      if (!isSafeStoragePath(path)) continue;

      // Storage represents folders as list entries without an object ID.
      if (!object.id) {
        objects.push(...await listFolderObjects(bucket, path));
      } else {
        objects.push({ bucket, path });
      }
    }

    if (!data || data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }

  return objects;
}

async function collectNamespacedStorageObjects(userId: string) {
  const groups = await Promise.all([
    listFlatUserObjects("portraits", userId),
    listFlatUserObjects("resumes", userId),
    listFlatUserObjects("transcripts", userId),
    listFlatUserObjects("project_thumbnails", userId),
    listFolderObjects("generated_resumes", userId),
    listFolderObjects("professional_headshots", `inputs/${userId}`),
    listFolderObjects("professional_headshots", `generated/${userId}`),
  ]);

  return groups.flat();
}

async function collectAccountResources(userId: string): Promise<AccountResources> {
  const admin = createAdminClient();
  const [
    profileResult,
    projectResult,
    resumeCacheResult,
    headshotCacheResult,
    subscriptionResult,
    portraits,
    resumes,
    transcripts,
    projectThumbnails,
    generatedResumes,
    headshotInputs,
    generatedHeadshots,
  ] = await Promise.all([
    admin
      .from("users")
      .select("portrait_url, resume_url, transcript_url")
      .eq("id", userId)
      .maybeSingle(),
    admin.from("projects").select("thumbnail_url").eq("user_id", userId),
    admin.from("cached_resumes").select("url").eq("user_id", userId),
    admin
      .from("cached_professional_headshots")
      .select("generated_url, reference_url, background_url")
      .eq("user_id", userId),
    admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle(),
    listFlatUserObjects("portraits", userId),
    listFlatUserObjects("resumes", userId),
    listFlatUserObjects("transcripts", userId),
    listFlatUserObjects("project_thumbnails", userId),
    listFolderObjects("generated_resumes", userId),
    listFolderObjects("professional_headshots", `inputs/${userId}`),
    listFolderObjects("professional_headshots", `generated/${userId}`),
  ]);

  for (const result of [
    profileResult,
    projectResult,
    resumeCacheResult,
    headshotCacheResult,
    subscriptionResult,
  ]) {
    if (result.error) {
      throw new Error(`Unable to inventory account resources: ${result.error.message}`);
    }
  }

  const objects = new Map<string, StorageObject>();
  for (const object of [
    ...portraits,
    ...resumes,
    ...transcripts,
    ...projectThumbnails,
    ...generatedResumes,
    ...headshotInputs,
    ...generatedHeadshots,
  ]) {
    addStorageObject(objects, object.bucket, object.path);
  }

  const profile = profileResult.data;
  addPublicUrlIfOwned(objects, profile?.portrait_url, "portraits", (path) =>
    isStorageObjectOwnedByUser(path, userId));
  addPublicUrlIfOwned(objects, profile?.resume_url, "resumes", (path) =>
    isStorageObjectOwnedByUser(path, userId));
  addPublicUrlIfOwned(objects, profile?.transcript_url, "transcripts", (path) =>
    isStorageObjectOwnedByUser(path, userId));

  for (const project of projectResult.data ?? []) {
    addPublicUrlIfOwned(
      objects,
      project.thumbnail_url,
      "project_thumbnails",
      (path) => isStorageObjectOwnedByUser(path, userId),
    );
  }

  for (const resume of resumeCacheResult.data ?? []) {
    addPublicUrlIfOwned(objects, resume.url, "generated_resumes", (path) =>
      isFileWithinFolder(path, userId));
  }

  for (const headshot of headshotCacheResult.data ?? []) {
    addPublicUrlIfOwned(
      objects,
      headshot.reference_url,
      "professional_headshots",
      (path) => isFileWithinFolder(path, `inputs/${userId}`),
    );
    addPublicUrlIfOwned(
      objects,
      headshot.background_url,
      "professional_headshots",
      (path) => isFileWithinFolder(path, `inputs/${userId}`),
    );
    addPublicUrlIfOwned(
      objects,
      headshot.generated_url,
      "professional_headshots",
      (path) =>
        isFileWithinFolder(path, `generated/${userId}`) ||
        /^generated\/[^/]+$/.test(path),
    );
  }

  return {
    stripeCustomerId: subscriptionResult.data?.stripe_customer_id ?? null,
    storageObjects: [...objects.values()],
  };
}

async function removeStorageObjects(objects: StorageObject[]) {
  const admin = createAdminClient();
  const pathsByBucket = new Map<string, string[]>();

  for (const object of objects) {
    const paths = pathsByBucket.get(object.bucket) ?? [];
    paths.push(object.path);
    pathsByBucket.set(object.bucket, paths);
  }

  for (const [bucket, paths] of pathsByBucket) {
    for (let index = 0; index < paths.length; index += REMOVE_BATCH_SIZE) {
      const batch = paths.slice(index, index + REMOVE_BATCH_SIZE);
      const { error } = await admin.storage.from(bucket).remove(batch);
      if (error) {
        if (isMissingBucketError(error)) break;
        throw new Error(`Unable to remove ${bucket} objects: ${error.message}`);
      }
    }
  }
}

async function deleteStripeCustomer(customerId: string | null) {
  if (!customerId) return;

  try {
    await stripe.customers.del(customerId);
  } catch (error) {
    const stripeError = error as { code?: string };
    if (stripeError.code !== "resource_missing") throw error;
  }
}

async function acquireDeletionLock(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("account_deletion_locks")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (error) {
    throw new Error(`Unable to lock account for deletion: ${error.message}`);
  }
}

async function releaseDeletionLock(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("account_deletion_locks")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Unable to release account deletion lock:", error);
  }
}

export async function deleteAccount(
  userId: string,
  sessionClient: SupabaseClient,
) {
  await acquireDeletionLock(userId);

  try {
    const resources = await collectAccountResources(userId);
    await removeStorageObjects(resources.storageObjects);

    // Revoke refresh tokens before removing the Auth identity. Access tokens
    // can remain valid until expiry, so all user APIs also enforce the lock.
    const { error: signOutError } = await sessionClient.auth.signOut({
      scope: "global",
    });
    if (signOutError) {
      throw new Error(`Unable to revoke user sessions: ${signOutError.message}`);
    }

    // Sweep server-issued namespaces again after session revocation. A request
    // that authenticated immediately before the lock may have completed an
    // upload after the first inventory; storage writers also roll back when
    // they observe the lock, making the two sides race-safe.
    const lateStorageObjects = await collectNamespacedStorageObjects(userId);
    await removeStorageObjects(lateStorageObjects);

    await deleteStripeCustomer(resources.stripeCustomerId);

    const admin = createAdminClient();
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      throw new Error(`Unable to delete Auth user: ${deleteUserError.message}`);
    }
  } catch (error) {
    await releaseDeletionLock(userId);
    throw error;
  }
}
