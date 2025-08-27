"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ButtonOne, ButtonThree } from "@/app/components/Buttons/buttons";
import TextInput from "@/app/components/TextInput/text-input";

import styles from "./LoginPage.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/internal/auth/login", {
        method: "POST",
        headers: { ContentType: "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      router.push("/user");
    } catch (err) {
      alert(err);
      setCredentials({ email: "", password: "" });
    }
  };

  const handleSignUp = () => {
    router.push("/user/create")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <TextInput
          label="Email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
        <TextInput
          label="Password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          type="password"
        />
        <ButtonOne type="submit" className={styles.loginButton}>Sign in</ButtonOne>
      </form >

      {/* Form Footer */}
      <div className={styles.formFooterContainer}>
        <div className={styles.dividerContainer}>
          <div className={styles.divider} />
          <p className={styles.inputLabel}>Other</p>
          <div className={styles.divider} />
        </div>
        <div className={styles.otherContent}>
          <p>Don&apos;t have an account?</p>
          <ButtonThree onClick={handleSignUp} className={styles.loginButton}>Sign up</ButtonThree>
          <a href="">Forgot password</a>
        </div>
      </div>
    </>
  );
}
