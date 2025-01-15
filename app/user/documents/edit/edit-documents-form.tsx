"use client";

import { Input, Typography, Button, Link } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage, compressPDF } from "@/utils/file-upload/compress";
import { uploadFile } from "@/utils/file-upload/upload";

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

  const handleSaveChanges = async () => {
    let success;

    if (portrait) {
      const compressedPortrait = await compressImage(portrait);
      success = await uploadFile(compressedPortrait, "portraits");
    }
    if (resume) {
      const compressedResume = await compressPDF(resume);
      success = await uploadFile(compressedResume, "resumes");
    }
    if (transcript) {
      const compressedTranscript = await compressPDF(transcript);
      success = await uploadFile(compressedTranscript, "transcripts");
    }

    if (success) {
      router.push("/user/documents");
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
      <Link
        underline="hover"
        href="/user/documents"
        textAlign="center"
        marginTop="1rem"
      >
        Return
      </Link>
    </>
  );
}
