"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import UserList from "./user-list";
import styles from "./UserHomePage.module.css";
import PageContentWrapper from "../components/PageContentWrapper/PageContentWrapper";

export default function UserHomePage() {
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
    <PageContentWrapper>
      <UserList user={user} />
    </PageContentWrapper>
  );
}
