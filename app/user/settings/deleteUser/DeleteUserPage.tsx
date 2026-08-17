"use client";

import { Info, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useToast } from "@/app/context/ToastProvider";
import { useUser } from "@/app/context/UserProvider";
import { headerFont } from "@/app/localFonts";

import styles from "./DeleteUserPage.module.css";
import { ButtonOne } from "@/app/components/Buttons/Buttons";
import { createDocumentationUrl } from "@/utils/navigation/documentation";

const DELETE_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export default function DeleteUserPage() {
    const { state } = useUser();
    const toast = useToast();
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [email, setEmail] = useState("");
    const [phrase, setPhrase] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const accountEmail = state.email;
    const emailMatches = Boolean(accountEmail) &&
        email.trim().toLowerCase() === accountEmail.trim().toLowerCase();
    const canConfirm = emailMatches &&
        phrase === DELETE_CONFIRMATION_PHRASE &&
        acknowledged &&
        !deleting;

    useEffect(() => {
        if (!showDialog) return;
        confirmButtonRef.current?.focus();

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !deleting) setShowDialog(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [deleting, showDialog]);

    const requestFinalConfirmation = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canConfirm) setShowDialog(true);
    };

    const deleteAccount = async () => {
        if (!canConfirm) return;
        setDeleting(true);
        toast.clear();

        try {
            const response = await fetch("/api/internal/user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, phrase, acknowledged }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data?.message ??
                    "Your account could not be deleted at this time. Please try again later.",
                );
            }

            window.location.replace("/user/login?accountDeleted=true");
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Your account could not be deleted at this time. Please try again later.";
            toast.error("Account deletion unavailable", message);
            setShowDialog(false);
            setDeleting(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={`${headerFont.className} ${styles.pageTitle}`}>
                        Delete Account
                    </h1>
                    <p>Permanently delete your Nukleio account and all associated data.</p>
                </div>

                <ButtonOne onClick={() => window.location.assign(createDocumentationUrl("deleteUser", window.location.href))}>
                    <span className={styles.infoButtonContent}>
                        <Info />
                        More Information
                    </span>
                </ButtonOne>
            </header>

            <section className={styles.warningPanel} aria-labelledby="delete-warning-heading">
                <div className={styles.warningHeading}>
                    <TriangleAlert size={28} aria-hidden="true" />
                    <h2 id="delete-warning-heading" className={headerFont.className}>
                        This action cannot be undone
                    </h2>
                </div>
                <p>Deleting your account permanently removes:</p>
                <ul>
                    <li>Your profile, portfolio, API keys, and API activity</li>
                    <li>Your AI credit balances and credit activity</li>
                    <li>Your uploaded documents, images, and project files</li>
                    <li>Your saved AI generations and generated files</li>
                    <li>Your billing profile and any active subscription</li>
                </ul>
                <p className={styles.refundNotice}>
                    Active subscriptions are canceled immediately. Account deletion does not issue an automatic refund.
                </p>
            </section>

            <form className={styles.confirmationForm} onSubmit={requestFinalConfirmation}>
                <div className={styles.field}>
                    <label htmlFor="delete-account-email">
                        Enter your account email
                    </label>
                    <input
                        id="delete-account-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={!accountEmail || deleting}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="delete-account-phrase">
                        Type <strong>{DELETE_CONFIRMATION_PHRASE}</strong> to continue
                    </label>
                    <input
                        id="delete-account-phrase"
                        type="text"
                        value={phrase}
                        onChange={(event) => setPhrase(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={deleting}
                        required
                    />
                </div>

                <label className={styles.acknowledgement}>
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(event) => setAcknowledged(event.target.checked)}
                        disabled={deleting}
                    />
                    <span>I understand that my account and data will be permanently deleted.</span>
                </label>

                <button
                    type="submit"
                    className={`${styles.deleteButton} ${headerFont.className}`}
                    disabled={!canConfirm}
                >
                    Continue to final confirmation
                </button>
            </form>

            {showDialog && (
                <div className={styles.dialogBackdrop}>
                    <div
                        className={styles.dialog}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="final-delete-title"
                        aria-describedby="final-delete-description"
                    >
                        <h2 id="final-delete-title" className={headerFont.className}>
                            Permanently delete your account?
                        </h2>
                        <p id="final-delete-description">
                            Your data will be deleted immediately and cannot be recovered.
                        </p>
                        <div className={styles.dialogButtons}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setShowDialog(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                ref={confirmButtonRef}
                                type="button"
                                className={styles.finalDeleteButton}
                                onClick={deleteAccount}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting account..." : "Permanently delete account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
