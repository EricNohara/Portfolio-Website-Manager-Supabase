"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import DocumentsList from "./documents-list";

export default function DocumentsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const authenticator = async () => {
      try {
        const res = await fetch("/api/auth/authenticated", { method: "GET" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.push("/");
      }
    };

    authenticator();
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        User Documents
      </Typography>
      <DocumentsList user={user} />
    </Container>
  );
}
