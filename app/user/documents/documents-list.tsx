"use client";

import { Button, Link, Box, Avatar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useDynamicRouteParams } from "next/dist/server/app-render/dynamic-rendering";

interface IUserDocuments {
  portrait_url: string;
  resume_url: string;
  transcript_url: string;
  name: string;
}

export default function DocumentsList({ user }: { user: User | null }) {
  const router = useRouter();

  const [documents, setDocuments] = useState({
    portrait_url: "",
    resume_url: "",
    transcript_url: "",
  });

  const [name, setName] = useState("");

  useEffect(() => {
    const fetcher = async () => {
      if (!user) return;
      const res = await fetch(`/api/user?id=${user?.id}`, { method: "GET" });
      const data = await res.json();

      if (res.ok) {
        const userData: IUserDocuments = data.userData;
        setDocuments({
          portrait_url: userData.portrait_url,
          resume_url: userData.resume_url,
          transcript_url: userData.transcript_url,
        });
        setName(userData.name);
      }
    };

    fetcher();
  }, [user]);

  const handleDelete = async (url: string) => {
    try {
      const res = await fetch(`/api/storage?publicURL=${url}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("Successfully deleted document");

      // add code to change the state variables necessary
      const documentValues = Object.values(documents);
      const updatedDocuments = { ...documents };

      if (documentValues[0] === url) {
        updatedDocuments.portrait_url = "";
      } else if (documentValues[0] === url) {
        updatedDocuments.resume_url = "";
      } else {
        updatedDocuments.transcript_url = "";
      }

      setDocuments(updatedDocuments);
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box
        display="grid"
        gridTemplateColumns="24% 59% 14%"
        gap="1%"
        rowGap="2rem"
        alignItems="center"
        marginBottom="2rem"
      >
        {documents.portrait_url ? (
          <>
            <Avatar
              alt="avatar"
              src={documents.portrait_url}
              sx={{ width: 100, height: 100 }}
            />
            <Link
              href={documents.portrait_url}
              underline="hover"
              marginLeft="1rem"
              target="_blank"
              rel="noopener"
            >
              {name}&apos;s Profile Image
            </Link>
            <Button
              type="submit"
              variant="contained"
              color="error"
              onClick={() => handleDelete(documents.portrait_url)}
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            <Avatar sx={{ width: 100, height: 100 }}>{name[0]}</Avatar>
            <Typography marginLeft="1rem">No profile image found</Typography>
            <Button
              type="submit"
              variant="contained"
              onClick={() => router.push("/user/documents/edit")}
            >
              Edit
            </Button>
          </>
        )}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Resume:
        </Typography>
        {documents.resume_url ? (
          <>
            <Link
              href={documents.resume_url}
              underline="hover"
              marginLeft="1rem"
              target="_blank"
              rel="noopener"
            >
              {name}&apos;s Resume
            </Link>
            <Button
              type="submit"
              variant="contained"
              color="error"
              onClick={() => handleDelete(documents.resume_url)}
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            {" "}
            <Typography marginLeft="1rem">No resume file found</Typography>
            <Button
              type="submit"
              variant="contained"
              onClick={() => router.push("/user/documents/edit")}
            >
              Edit
            </Button>
          </>
        )}

        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Transcript:
        </Typography>
        {documents.transcript_url ? (
          <>
            <Link
              href={documents.transcript_url}
              underline="hover"
              marginLeft="1rem"
              target="_blank"
              rel="noopener"
            >
              {name}&apos;s Transcript
            </Link>
            <Button
              type="submit"
              variant="contained"
              color="error"
              onClick={() => handleDelete(documents.transcript_url)}
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            <Typography marginLeft="1rem">No transcript file found</Typography>
            <Button
              type="submit"
              variant="contained"
              onClick={() => router.push("/user/documents/edit")}
            >
              Edit
            </Button>
          </>
        )}
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/documents/edit")}
      >
        Edit
      </Button>
    </Box>
  );
}
