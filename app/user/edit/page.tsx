"use client";

import { Typography, Container } from "@mui/material";
import EditUserForm from "./edit-user-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        Edit User Information
      </Typography>
      <EditUserForm user={user} />
    </Container>
  );
}
