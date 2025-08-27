"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ButtonOne, ButtonThree } from "@/app/components/Buttons/buttons";
import TextInput from "@/app/components/TextInput/text-input";

import styles from "../login/LoginPage.module.css";

interface IInputData {
  email: string;
  password: string;
  confirmedPassword: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const [userData, setUserData] = useState<IInputData>({
    email: "",
    password: "",
    confirmedPassword: "",
  });

  const minPasswordLen: number = parseInt(process.env.MIN_PASSWORD_LEN || "6");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (userData.password.length < minPasswordLen) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (userData.password !== userData.confirmedPassword) {
        throw new Error("Confirmed password does not match inputted password")
      }

      const res = await fetch("/api/internal/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Successfully Created User!");
      router.push("/user");
    } catch (error) {
      alert(error);
    }
  };

  const handleLogin = () => {
    router.push("/user/login")
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <TextInput
          label="Email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
        <TextInput
          label="Password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          type="password"
        />
        <TextInput
          label="Confirm Password"
          name="confirmedPassword"
          value={userData.confirmedPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          type="password"
        />
        <ButtonOne type="submit" className={styles.loginButton}>Sign up</ButtonOne>
      </form>

      {/* Form Footer */}
      <div className={styles.formFooterContainer}>
        <div className={styles.dividerContainer}>
          <div className={styles.divider} />
          <p className={styles.inputLabel}>Other</p>
          <div className={styles.divider} />
        </div>
        <div className={styles.otherContent}>
          <p>Already have an account?</p>
          <ButtonThree onClick={handleLogin} className={styles.loginButton}>Sign in</ButtonThree>
        </div>
      </div>
    </>
  );
}
