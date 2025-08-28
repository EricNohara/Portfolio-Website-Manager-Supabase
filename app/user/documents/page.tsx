"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import Navigation from "@/app/components/Navigation/Navigation";

import DocumentsList from "./documents-list";
import styles from "../UserHomePage.module.css";

export default function DocumentsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const authenticator = async () => {
      try {
        const res = await fetch("/api/internal/auth/authenticated", { method: "GET" });
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
    <div className={styles.pageContainer} >
      <Navigation />
      <DocumentsList user={user} />
    </div>
  );
}
