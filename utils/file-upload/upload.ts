export default async function uploadFile(file: File, bucketName: string) {
  let success = true;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucketName", bucketName);

  try {
    const res = await fetch("/api/storage", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message.message);
    }

    alert("Successfully uploaded file");
  } catch (err) {
    const error = err as Error;
    alert("Error uploading file: " + error.message);
    success = false;
  }

  return success;
}
