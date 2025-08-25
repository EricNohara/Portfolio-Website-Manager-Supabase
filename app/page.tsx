"use client";

// import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ButtonOne } from "./components/Buttons/Buttons";

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
    <div><ButtonOne>Testing</ButtonOne></div>
  );
}
