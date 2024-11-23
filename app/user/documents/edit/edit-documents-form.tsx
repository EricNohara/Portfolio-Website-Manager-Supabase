"use client";

import { Input, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditDocumentsForm() {
  const router = useRouter();
  const [portrait, setPortrait] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile: File | null = e.target.files?.[0] || null;
    const { name } = e.target;

    if (name === "portrait") {
      setPortrait(selectedFile);
    } else if (name === "resume") {
      setResume(selectedFile);
    } else if (name === "transcript") {
      setTranscript(selectedFile);
    }
  };

  const handleSaveChanges = () => {
    const uploadFile = async (file: File, bucketName: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucketName", bucketName);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Error uploading file!");
      } else {
        alert("Successfully uploaded file");
      }
    };

    if (portrait) {
      uploadFile(portrait, "portraits");
    }
    if (resume) {
      uploadFile(resume, "resumes");
    }
    if (transcript) {
      uploadFile(transcript, "transcripts");
    }
  };

  return (
    <>
      <Typography variant="h6" marginTop="2rem">
        Portrait Image Upload
      </Typography>
      <Input
        type="file"
        name="portrait"
        inputProps={{ accept: "image/*" }}
        fullWidth
        onChange={handleFileChange}
      />
      <Typography variant="h6" marginTop="2rem">
        Resume Upload (PDF Only)
      </Typography>
      <Input
        type="file"
        name="resume"
        inputProps={{ accept: "application/pdf" }}
        fullWidth
        onChange={handleFileChange}
      />
      <Typography variant="h6" marginTop="2rem">
        Transcript Upload (PDF Only)
      </Typography>
      <Input
        type="file"
        name="transcript"
        inputProps={{ accept: "application/pdf" }}
        fullWidth
        onChange={handleFileChange}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSaveChanges}
      >
        Save Changes
      </Button>
    </>
  );
}
