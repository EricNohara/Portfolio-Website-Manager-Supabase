export type ParsedStoragePublicURL = {
  parsedBucket: string;
  parsedFilename: string;
};

export default function parseURL(
  url: string,
): ParsedStoragePublicURL | null {
  try {
    const configuredSupabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!configuredSupabaseURL) return null;

    const parsedURL = new URL(url);
    const supabaseURL = new URL(configuredSupabaseURL);
    if (parsedURL.origin !== supabaseURL.origin) return null;

    const publicObjectPrefix = "/storage/v1/object/public/";
    if (!parsedURL.pathname.startsWith(publicObjectPrefix)) return null;

    const objectIdentifier = parsedURL.pathname.slice(publicObjectPrefix.length);
    const bucketSeparatorIndex = objectIdentifier.indexOf("/");
    if (bucketSeparatorIndex <= 0) return null;

    const parsedBucket = decodeURIComponent(
      objectIdentifier.slice(0, bucketSeparatorIndex),
    );
    const parsedFilename = decodeURIComponent(
      objectIdentifier.slice(bucketSeparatorIndex + 1),
    );

    if (!parsedBucket || !parsedFilename) return null;

    return { parsedBucket, parsedFilename };
  } catch {
    return null;
  }
}

export function isStorageObjectOwnedByUser(
  filename: string,
  userID: string,
): boolean {
  const ownerPrefix = `${userID}-`;

  return (
    filename.startsWith(ownerPrefix) &&
    filename.length > ownerPrefix.length &&
    !filename.includes("/") &&
    !filename.includes("\\") &&
    !filename.includes("\0")
  );
}
