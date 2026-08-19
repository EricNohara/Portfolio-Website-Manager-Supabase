"use client";

import { Info, Landmark, LockKeyhole, Trash2, TriangleAlert, User } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { ButtonOne, DeleteButton } from "@/app/components/Buttons/Buttons";
import Overlay from "@/app/components/Overlay/Overlay";
import TextInput from "@/app/components/TextInput/TextInput";
import { useToast } from "@/app/context/ToastProvider";
import { useUser } from "@/app/context/UserProvider";
import { headerFont } from "@/app/localFonts";
import { createDocumentationUrl } from "@/utils/navigation/documentation";

import styles from "./DeleteUserPage.module.css";

const DELETE_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export default function DeleteUserPage() {
    const { state } = useUser();
    const toast = useToast();
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
                <div>
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

            <div className={styles.panels}>
                <section
                    className={`${styles.panel} ${styles.warningPanel}`}
                    aria-labelledby="delete-warning-heading"
                >
                    <div className={styles.panelHeading}>
                        <span className={styles.panelHeaderIcon}>
                            <TriangleAlert aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="delete-warning-heading" className={headerFont.className}>
                                Before you delete
                            </h2>
                            <p>This action cannot be undone</p>
                        </div>
                    </div>

                    <div className={styles.warningItem}>
                        <span>
                            <User />
                        </span>
                        <div className={styles.warningItemText}>
                            <h3>All your data will be lost</h3>
                            <p>Profile, API keys, documents, AI generations</p>
                        </div>
                    </div>

                    <div className={styles.warningItem}>
                        <span>
                            <Landmark />
                        </span>
                        <div className={styles.warningItemText}>
                            <h3>Financial data will be removed</h3>
                            <p>AI credit balance, billing profile, invoices</p>
                        </div>
                    </div>

                    <div className={styles.warningItem}>
                        <span>
                            <LockKeyhole />
                        </span>
                        <div className={styles.warningItemText}>
                            <h3>Access will be permanently removed</h3>
                            <p>You won&apos;t be able to sign in or recover any data</p>
                        </div>
                    </div>

                    <div className={styles.subscriptionNotice}>
                        <Info size={30} />
                        <div>
                            <h3>Subscriptions are canceled immediately</h3>
                            <p>Account deletion does not issue a refund</p>
                        </div>
                    </div>
                </section>

                <form className={styles.panel} onSubmit={requestFinalConfirmation}>
                    <div className={styles.panelHeading}>
                        <span className={styles.panelHeaderIcon}>
                            <Trash2 aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="delete-warning-heading" className={headerFont.className}>
                                Delete your account
                            </h2>
                            <p>Please provide the information below</p>
                        </div>
                    </div>

                    <TextInput
                        label="Account email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={!accountEmail || deleting}
                        required
                    />

                    <TextInput
                        label={`Type ${DELETE_CONFIRMATION_PHRASE} to continue`}
                        name="phrase"
                        type="text"
                        value={phrase}
                        onChange={(event) => setPhrase(event.target.value)}
                        disabled={deleting}
                        required
                    />

                    <label className={styles.acknowledgement}>
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(event) => setAcknowledged(event.target.checked)}
                            disabled={deleting}
                        />
                        <span>I understand that my account and data will be permanently deleted. This action cannot be undone.</span>
                    </label>

                    <DeleteButton type="submit" className={styles.deleteButton} disabled={!canConfirm}>
                        <span>
                            <Trash2 />
                            Delete my account
                        </span>
                    </DeleteButton>
                </form>
            </div>

            {showDialog && (
                <Overlay onClose={() => setShowDialog(false)}>
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
                            <DeleteButton
                                type="button"
                                className={styles.deleteButton}
                                onClick={deleteAccount}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting account..." : "Permanently delete account"}
                            </DeleteButton>

                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setShowDialog(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Overlay>
            )}
        </div>
    );
}
