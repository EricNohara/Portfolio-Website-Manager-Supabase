"use client";

import { Button } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/app/context/AuthProvider";

import styles from "./Navigation.module.css";
import { ButtonOne, ButtonTwo } from "../Buttons/Buttons";
import TitleLogo from "../TitleLogo/TitleLogo";


export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    // Fetch user when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/internal/auth/authenticated", { method: "GET" });
            if (!res.ok) setIsLoggedIn(false);
            else setIsLoggedIn(true);
        };

        fetchUser();
    }, [setIsLoggedIn]);

    useEffect(() => {
        console.log("IS LOGGED IN:", isLoggedIn);
    }, [isLoggedIn]);

    const handleSignOut = async () => {
        try {
            const res = await fetch("/api/internal/auth/signout", { method: "POST" });

            if (res.ok) {
                setIsLoggedIn(false);
                router.push("/");
            } else {
                alert("Failed to sign out");
            }
        } catch (err) {
            console.error(err);
        }
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

    return (isLanding ?
        // Navigation for the landing page
        <nav className={styles.horizontalNav} >
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
        </nav>
        : isLoginOrSignUp ?
            // Navigation for login and sign up pages
            <nav className={styles.loginNav}>
                <div></div>
                <ul className={styles.landingLinks}>
                    <li><a href="">Product</a></li>
                    <li><a href="">Docs</a></li>
                    <li><a href="">Pricing</a></li>
                    <li><a href="">Contact</a></li>
                </ul>
            </nav>
            : isLoggedIn ?
                <nav>
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
                </nav>
                : null
    );
}
