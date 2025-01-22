"use client";

import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Drawer } from "@mui/material";
import { useAuth } from "./context/AuthProvider";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mui/material";
import { Menu } from "@mui/icons-material";

export default function Navigation() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery("(max-width: 950px)"); // make sure that the screen is not too small

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

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const navItems = [
    { label: "home", path: "/user" },
    { label: "documents", path: "/user/documents" },
    { label: "experience", path: "/user/experience" },
    { label: "education", path: "/user/education" },
    { label: "projects", path: "/user/projects" },
    { label: "skills", path: "/user/skills" },
    { label: "connect", path: "'/user/connect" },
    { label: "Sign Out", action: handleSignOut },
  ];

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Portfolio Editor
        </Typography>
        {isLoggedIn ? (
          isSmallScreen ? (
            <>
              <Button
                color="inherit"
                onClick={() => {
                  toggleDrawer(true);
                }}
              >
                <Menu />
              </Button>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
              >
                {navItems.map((item, index) => (
                  <Button
                    key={index}
                    color="inherit"
                    onClick={() => {
                      if (item.path) router.push(item.path);
                      else if (item.action) item.action();
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Drawer>
            </>
          ) : (
            navItems.map((item, index) => (
              <Button
                key={index}
                color="inherit"
                onClick={() => {
                  if (item.path) router.push(item.path);
                  else if (item.action) item.action();
                }}
              >
                {item.label}
              </Button>
            ))
          )
        ) : (
          <>
            <Button color="inherit" onClick={() => router.push("/")}>
              Home
            </Button>
            <Button color="inherit" onClick={() => router.push("/user/login")}>
              Log In
            </Button>
            <Button color="inherit" onClick={() => router.push("/user/create")}>
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
