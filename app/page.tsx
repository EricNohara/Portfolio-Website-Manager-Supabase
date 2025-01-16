"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthProvider";
import { useEffect } from "react";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/user");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="row">
      <div className="col-12">
        <h1 className="header">Supabase Auth + Storage</h1>
        <p>
          Experience our Auth and Storage through a simple profile management
          example. Create a user profile and upload an avatar image. Fast,
          simple, secure.
        </p>
      </div>
      <div className="col-6 form-widget">
        <Link href="/user/login">Auth page</Link>
      </div>
    </div>
  );
}
