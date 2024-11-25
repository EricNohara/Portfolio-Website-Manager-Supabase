"use client";

import { useEffect } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "./context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  // Fetch user when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/authenticated", { method: "GET" });

      if (!res.ok) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    };

    fetchUser();
  }, [setIsLoggedIn]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });

      if (res.ok) {
        setIsLoggedIn(false);
        router.push("/user/login");
      } else {
        alert("Failed to sign out");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return isLoggedIn ? (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Portfolio Editor
        </Typography>
        <Button color="inherit" onClick={() => router.push("/user")}>
          Home
        </Button>
        <Button color="inherit" onClick={() => router.push("/user/documents")}>
          Documents
        </Button>
        <Button color="inherit" onClick={() => router.push("/user/experience")}>
          Experience
        </Button>
        <Button color="inherit" onClick={() => router.push("/user/education")}>
          Education
        </Button>
        <Button color="inherit" onClick={handleSignOut}>
          Sign out
        </Button>
      </Toolbar>
    </AppBar>
  ) : null; // Return null if the user is not logged in
}
