"use client";

import { Menu } from "@mui/icons-material";
import { Button, Drawer } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TitleLogo from "../TitleLogo/TitleLogo";
import { ButtonOne, ButtonTwo } from "../Buttons/Buttons";
import styles from "./Navigation.module.css";

import { useAuth } from "@/app/context/AuthProvider";

export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const isSmallScreen = useMediaQuery("(max-width: 950px)");

    // Fetch user when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/internal/auth/authenticated", { method: "GET" });
            if (!res.ok) setIsLoggedIn(false);
            else setIsLoggedIn(true);
        };

        fetchUser();
    }, [setIsLoggedIn]);

    const handleSignOut = async () => {
        try {
            const res = await fetch("/api/internal/auth/signout", { method: "POST" });

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
        { label: "connect", path: "/user/connect" },
        { label: "Sign Out", action: handleSignOut },
    ];

    // Check if we're on landing or login
    const isLanding = pathname === "/";
    const isLoginOrSignUp = pathname === "/user/login" || pathname === "/user/create";

    const handleSignIn = () => {
        router.push("/user/login")
    }

    const handleSignUp = () => {
        router.push("/user/create")
    }

    return (
        <nav className={styles.horizontalNav}>
            {isLanding ? (
                // Navigation for the landing page
                <>
                    <TitleLogo />
                    <ul className={styles.landingLinks}>
                        <li><a href="">Product</a></li>
                        <li><a href="">Docs</a></li>
                        <li><a href="">Pricing</a></li>
                        <li><a href="">Contact</a></li>
                    </ul>
                    <div className={styles.buttonsContainer}>
                        <ButtonTwo onClick={handleSignIn}>Sign in</ButtonTwo>
                        <ButtonOne onClick={handleSignUp}>Sign up</ButtonOne>
                    </div>
                </>
            ) : isLoginOrSignUp ? (
                <>
                    {/* Custom nav for landing/login */}
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
            ) : isLoggedIn ? (
                // Logged-in nav
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
            ) : null}
        </nav>
    );
}
