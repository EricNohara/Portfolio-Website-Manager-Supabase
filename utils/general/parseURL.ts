export default function parseURL(url: string) {
  const splitURL = url.split("/");
  const parsedBucket = splitURL[splitURL.length - 2];
  const encodedName = splitURL[splitURL.length - 1];
  const parsedFilename = decodeURIComponent(encodedName);
  return { parsedBucket, parsedFilename };
}
