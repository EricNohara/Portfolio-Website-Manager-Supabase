"use client";

import { Button, Link, Box, Avatar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

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

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" marginBottom="2rem">
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
              {name}&apos;s Profile Image Link
            </Link>
          </>
        ) : (
          <>
            <Avatar sx={{ width: 100, height: 100 }}>{name[0]}</Avatar>
            <Typography marginLeft="1rem">No profile image found</Typography>
          </>
        )}
      </Box>
      <Box display="flex" alignItems="center" marginBottom="2rem">
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Resume:
        </Typography>
        {documents.resume_url ? (
          <Link
            href={documents.resume_url}
            underline="hover"
            marginLeft="1rem"
            target="_blank"
            rel="noopener"
          >
            {name}&apos;s Resume PDF Link
          </Link>
        ) : (
          <Typography marginLeft="1rem">No resume file found</Typography>
        )}
      </Box>
      <Box display="flex" alignItems="center" marginBottom="2rem">
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Transcript:
        </Typography>
        {documents.transcript_url ? (
          <Link
            href={documents.transcript_url}
            underline="hover"
            marginLeft="1rem"
            target="_blank"
            rel="noopener"
          >
            {name}&apos;s Transcript PDF Link
          </Link>
        ) : (
          <Typography marginLeft="1rem">No transcript file found</Typography>
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
      <Link underline="hover" href="/user" textAlign="center" marginTop="1rem">
        Return
      </Link>
    </Box>
  );
}
