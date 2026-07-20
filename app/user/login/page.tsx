"use client";

import React from "react";

import AuthBackground from "@/app/components/AuthBackground/AuthBackground";
import Navigation from "@/app/components/Navigation/Navigation";
import TitleLogo from "@/app/components/TitleLogo/TitleLogo";
import { titleFont, headerFont } from "@/app/localFonts";

import LoginForm from "./LoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <h1 className={`${styles.formTitle} ${titleFont.className}`}>Welcome back to your portfolio manager</h1>
        <h3 className={`${styles.formSubtitle} ${headerFont.className}`}>Sign in now to begin managing</h3>
        <LoginForm />
      </div>

      <div className={styles.rightPanel}>
        <AuthBackground />
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