"use client";

import Image from "next/image";
import React from "react";

import Navigation from "@/app/components/Navigation/navigation";
import TitleLogo from "@/app/components/TitleLogo/title-logo";

import SignUpForm from "./sign-up-form";
import styles from "../login/LoginPage.module.css";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <h1 className={styles.formTitle}>Effortlessly manage your portfolio sites</h1>
        <h3 className={styles.formSubtitle}>Sign up now completely free</h3>
        <SignUpForm />
      </div>

      {/* Right side (background image with nav) */}
      <div className={styles.rightPanel}>
        <Image
          src="/images/login-signup-graphic.svg"
          alt="Login Signup Graphic"
          fill
          priority
          className={styles.backgroundImage}
        />
        <div className={styles.navWrapper}>
          <Navigation />
        </div>
        <div className={styles.titleLogoWrapper}>
          <TitleLogo />
        </div>
      </div>
    </div>
  );
}
