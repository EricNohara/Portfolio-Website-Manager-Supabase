export async function uploadFile(file: File | null, bucketName: string) {
  if (!file || !bucketName || bucketName === "") return false;

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

export async function uploadThumbnail(file: File | null, bucketName: string) {
  if (!file || !bucketName || bucketName === "") return false;

  let publicURL = "";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucketName", bucketName);

  try {
    const res = await fetch("/api/storage", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    publicURL = data.publicURL;

    if (!res.ok) throw new Error(data.message.message);
  } catch (err) {
    const error = err as Error;
    console.log(err);
    alert("Error uploading file: " + error.message);
  }

  return publicURL;
}
