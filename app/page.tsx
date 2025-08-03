"use client";

import { Typography, Container, Button, Box } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./context/AuthProvider";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/user");
    }
  }, [isLoggedIn, router]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2.5rem",
        backgroundColor: "#f5f5f5",
        borderRadius: "1rem",
      }}
    >
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        PORTFOLIO WEBSITE MANAGER
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          color: "#616161",
          fontStyle: "italic",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Effortlessly manage portfolio websites with an all-in-one platform.
        Update information in one place. Automatically synced to connected
        websites through a provided API, eliminating manual updates.
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: "#616161",
          textAlign: "center",
        }}
      >
        Powered by Supabase and Next.js, keeping websites up-to-date is simple.
      </Typography>
      <Box display="flex" alignItems="center" gap="2rem">
        <Image src="/images/clouds.png" alt="clouds" width={300} height={300} />
        <Image
          src="/images/website.png"
          alt="website"
          width={200}
          height={200}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/login")}
        sx={{ fontSize: "1.5rem" }}
      >
        Get Started
      </Button>
    </Container>
  );
}
