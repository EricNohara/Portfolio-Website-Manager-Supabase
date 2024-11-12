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
    const selectedFile = e.target.files?.[0] || null;
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
    if (portrait) {
      console.log("Portrait file selected:", portrait);
    }
    if (resume) {
      console.log("Resume file selected:", resume);
    }
    if (transcript) {
      console.log("Transcript file selected:", transcript);
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
