"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

import LoadableButtonContent from "@/app/components/AsyncButtonWrapper/LoadableButtonContent/LoadableButtonContent";
import { ButtonOne, ButtonThree } from "@/app/components/Buttons/Buttons";
import ContinueWithAzureButton from "@/app/components/OauthButtons/ContinueWithAzureButton";
import ContinueWithGithubButton from "@/app/components/OauthButtons/ContinueWithGithubButton";
import ContinueWithGitlabButton from "@/app/components/OauthButtons/ContinueWithGitlabButton";
import ContinueWithGoogleButton from "@/app/components/OauthButtons/ContinueWithGoogleButton";
import ContinueWithLinkedinButton from "@/app/components/OauthButtons/ContinueWithLinkedinButton";
import TextInput from "@/app/components/TextInput/TextInput";
import { useToast } from "@/app/context/ToastProvider";
import { headerFont } from "@/app/localFonts";

import styles from "../login/LoginPage.module.css";

interface IInputData {
  email: string;
  password: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function SignUpForm() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<IInputData>({
    email: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const captchaWidgetIdRef = useRef<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const minPasswordLen: number = parseInt(process.env.MIN_PASSWORD_LEN || "6");

  const renderTurnstile = useCallback(() => {
    if (
      !turnstileSiteKey ||
      !captchaContainerRef.current ||
      !window.turnstile ||
      captchaWidgetIdRef.current
    ) {
      return;
    }

    captchaWidgetIdRef.current = window.turnstile.render(
      captchaContainerRef.current,
      {
        sitekey: turnstileSiteKey,
        callback: (token) => {
          setCaptchaToken(token);
          setCaptchaError(null);
        },
        "expired-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("The CAPTCHA expired. Please complete it again.");
        },
        "error-callback": () => {
          setCaptchaToken(null);
          setCaptchaError("The CAPTCHA could not be verified. Please try again.");
        },
      },
    );
  }, [turnstileSiteKey]);

  const resetTurnstile = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaError(null);
    if (captchaWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(captchaWidgetIdRef.current);
    }
  }, []);

  useEffect(() => {
    renderTurnstile();
    return () => {
      if (captchaWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(captchaWidgetIdRef.current);
        captchaWidgetIdRef.current = null;
      }
    };
  }, [renderTurnstile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      if (userData.password.length < minPasswordLen) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (!captchaToken) {
        throw new Error("Complete the CAPTCHA challenge before signing up.");
      }

      const res = await fetch("/api/internal/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      router.push(
        `/user/signup/confirm-email?email=${encodeURIComponent(userData.email)}&sent=1`,
      );
    } catch (error) {
      const err = error as Error
      toast.error("Error", err.message)
    } finally {
      setIsLoading(false);
      resetTurnstile();
    }
  };

  const handleLogin = () => {
    router.push("/user/login");
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderTurnstile}
      />
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

        <div ref={captchaContainerRef} />
        {!turnstileSiteKey && (
          <p className={styles.inputLabel}>
            Signup is temporarily unavailable. Please try again later.
          </p>
        )}
        {captchaError && <p className={styles.inputLabel}>{captchaError}</p>}

        <ButtonOne type="submit" className={styles.loginButton} disabled={isLoading || !captchaToken || !turnstileSiteKey}>
          <LoadableButtonContent isLoading={isLoading} buttonLabel="Sign up" />
        </ButtonOne>
      </form>

      {/* Form Footer */}
      <div className={styles.formFooterContainer}>
        <div className={styles.dividerContainer}>
          <div className={styles.divider} />
          <p className={`${styles.inputLabel} ${headerFont.className}`}>more</p>
          <div className={styles.divider} />
        </div>

        <div className={styles.oauthButtonsContainer}>
          <ContinueWithGithubButton />
          <ContinueWithGitlabButton />
          <ContinueWithLinkedinButton />
          <ContinueWithGoogleButton />
          <ContinueWithAzureButton />
        </div>

        <div className={styles.otherContent}>
          <p>Already have an account?</p>
          <ButtonThree onClick={handleLogin} className={styles.loginButton}>Sign in</ButtonThree>
        </div>
      </div>
    </>
  );
}
