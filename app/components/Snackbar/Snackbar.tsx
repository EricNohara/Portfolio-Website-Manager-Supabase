"use client";

import {
    X,
    TriangleAlert,
    CircleAlert,
    CircleCheck,
    Info,
    LucideIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import styles from "./Snackbar.module.css";

export type SnackbarVariant = "success" | "error" | "warning" | "info";

export type SnackbarState = {
    message: string;
    messageDescription?: string;
    variant: SnackbarVariant;
} | null;

type SnackbarProps = {
    message: string;
    messageDescription?: string;
    variant?: SnackbarVariant;
    onClose?: () => void;
    duration?: number;
};

const EXIT_MS = 200;

const ICONS: Record<SnackbarVariant, LucideIcon> = {
    success: CircleCheck,
    error: TriangleAlert,
    warning: CircleAlert,
    info: Info,
};

export default function Snackbar({
    message,
    messageDescription = "",
    variant = "info",
    onClose,
    duration = 4000,
}: SnackbarProps) {
    const [isExiting, setIsExiting] = useState(false);

    const startClose = useCallback(() => {
        if (isExiting) return;

        setIsExiting(true);

        window.setTimeout(() => {
            onClose?.();
        }, EXIT_MS);
    }, [isExiting, onClose]);

    useEffect(() => {
        if (!duration) return;

        const timer = window.setTimeout(startClose, duration);

        return () => clearTimeout(timer);
    }, [duration, startClose]);

    const Icon = ICONS[variant];

    return (
        <div
            className={`${styles.snackbar} ${styles[variant]} ${isExiting ? styles.exit : styles.enter
                }`}
            role="status"
            aria-live="polite"
        >
            <div className={styles.accent} />

            <div className={styles.iconContainer}>
                <Icon size={30} />
            </div>

            <div className={styles.messageContainer}>
                <h3>{message}</h3>
                {messageDescription && <span>{messageDescription}</span>}
            </div>

            {onClose && (
                <button
                    className={styles.close}
                    onClick={startClose}
                    aria-label="Close notification"
                    type="button"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}