"use client";

import { useLanguage } from "@/app/context/LanguageProvider";

import styles from "./LoadableButtonContent.module.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

interface ILoadableButtonContentProps {
    isLoading: boolean;
    buttonLabel: string;
}

export default function LoadableButtonContent({ isLoading, buttonLabel }: ILoadableButtonContentProps) {
    const { t } = useLanguage();

    return (
        <div className={styles.buttonContent}>
            <span className={`${styles.contentWrapper} ${isLoading ? styles.invisible : ""}`}>{t(buttonLabel)}</span>
            {isLoading && <LoadingSpinner />}
        </div>
    );
}
