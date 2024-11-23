"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "./context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const supabase = createClient();

  // Fetch user when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Set login state based on user presence
      setIsLoggedIn(!!user); // If user exists, set loggedIn to true, otherwise false
    };

    fetchUser();
  }, [supabase, setIsLoggedIn]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/auth/signout", { method: "POST" });

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

  const handleHome = () => {
    router.push("/user");
  };

  return isLoggedIn ? (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Portfolio Editor
        </Typography>
        <Button color="inherit" onClick={handleHome}>
          Home
        </Button>
        <Button color="inherit" onClick={handleSignOut}>
          Sign out
        </Button>
      </Toolbar>
    </AppBar>
  ) : null; // Return null if the user is not logged in
}
