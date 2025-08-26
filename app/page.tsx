"use client";

// import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ButtonOne, ButtonTwo, ButtonThree, EditButton, DeleteButton, ExitButton } from "./components/Buttons/Buttons";

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
    <div>
      <ButtonOne>Testing</ButtonOne>
      <ButtonTwo>Testing</ButtonTwo>
      <ButtonThree>Testing</ButtonThree>
      <EditButton>Testing</EditButton>
      <DeleteButton>Testing</DeleteButton>
      <ExitButton>Testing</ExitButton>
    </div>
  );
}
