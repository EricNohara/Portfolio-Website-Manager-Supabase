"use client";

import { Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import EditUserForm from "./edit-user-form";

export default function Account() {
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
        gutterBottom
        className="text-center"
        fontWeight="bold"
      >
        Edit User Information
      </Typography>
      <EditUserForm user={user} />
    </Container>
  );
}
