"use client";

import React, { useEffect, useRef, useState } from "react";

import LoadableButtonContent from "@/app/components/AsyncButtonWrapper/LoadableButtonContent/LoadableButtonContent";
import { ButtonOne, ButtonFour } from "@/app/components/Buttons/Buttons";
import SelectDropdown from "@/app/components/SelectDropdown/SelectDropdown";
import Switch from "@/app/components/Switch/Switch";
import { useLanguage } from "@/app/context/LanguageProvider";
import { useToast } from "@/app/context/ToastProvider";
import { AppLanguage, isAppLanguage, LANGUAGE_OPTIONS } from "@/app/i18n/translations";
import { headerFont } from "@/app/localFonts";
import { applyTheme, getStoredTheme, Theme, setStoredTheme, BorderRadius, getStoredBorderRadius, applyBorderRadius, setStoredBorderRadius } from "@/utils/general/theme";

import styles from "./EditAppForm.module.css";

interface IAppSettings {
    isDarkMode: boolean;
    isHighContrastMode: boolean;
    language: AppLanguage;
    borderRadius: BorderRadius;
}

const DEFAULT_APP_SETTINGS: IAppSettings = {
    isDarkMode: false,
    isHighContrastMode: false,
    language: "en",
    borderRadius: "balanced"
};

export default function EditAppForm() {
    const [formData, setFormData] = useState<IAppSettings>(DEFAULT_APP_SETTINGS);
    const [initialData, setInitialData] = useState<IAppSettings>(DEFAULT_APP_SETTINGS);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const hasInitialized = useRef(false);
    const { isReady: isLanguageReady, language, setLanguage, t } = useLanguage();
    const toast = useToast();

    const borderRadiusOptions = [
        { value: "sharp", label: t("Sharp") },
        { value: "balanced", label: t("Balanced") },
        { value: "rounded", label: t("Rounded") },
    ];

    // Initialize from localStorage (or current DOM class)
    useEffect(() => {
        if (!isLanguageReady || hasInitialized.current) return;

        const storedTheme = getStoredTheme();
        const storedRadius = getStoredBorderRadius();

        const domIsDark = document.documentElement.classList.contains("dark-theme");
        const isDarkMode = storedTheme ? storedTheme === "dark" : domIsDark;
        const borderRadius = storedRadius ?? "balanced";

        applyTheme(isDarkMode ? "dark" : "light");
        applyBorderRadius(borderRadius);

        const nextSettings: IAppSettings = {
            ...DEFAULT_APP_SETTINGS,
            isDarkMode,
            borderRadius,
            language,
        };

        setFormData(nextSettings);
        setInitialData(nextSettings);
        hasInitialized.current = true;
    }, [isLanguageReady, language]);

    const handleToggle = (key: "isDarkMode" | "isHighContrastMode") => {
        setFormData((prev) => {
            const next = {
                ...prev,
                [key]: !prev[key],
            };

            if (key === "isDarkMode") {
                const theme: Theme = next.isDarkMode ? "dark" : "light";
                applyTheme(theme);
                setStoredTheme(theme);
            }

            return next;
        });
    };

    const handleLanguageChange = (value: string) => {
        if (!isAppLanguage(value)) return;

        setFormData((prev) => ({
            ...prev,
            language: value,
        }));
        setLanguage(value);
    };

    const handleBorderRadiusChange = (value: string) => {
        const borderRadius = value as BorderRadius;

        setFormData((prev) => ({
            ...prev,
            borderRadius,
        }));

        applyBorderRadius(borderRadius);
        setStoredBorderRadius(borderRadius);
    };

    const handleCancel = () => {
        setFormData(initialData);
        setIsEditing(false);
        setIsLoading(false);

        applyTheme(initialData.isDarkMode ? "dark" : "light");
        applyBorderRadius(initialData.borderRadius);
        setStoredTheme(initialData.isDarkMode ? "dark" : "light");
        setStoredBorderRadius(initialData.borderRadius);
        setLanguage(initialData.language);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            setInitialData(formData);

            toast.success(
                t("Success"),
                t("App settings updated successfully.")
            );

            setIsEditing(false);
        } catch {
            toast.error(t("Error"), t("Error updating your app settings."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.inputForm} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
                <div className={styles.headerText}>
                    <h1 className={`${headerFont.className} ${styles.formTitle}`}>{t("App Settings")}</h1>
                    <h3 className={`${styles.formSubtitle} ${headerFont.className}`}>
                        {t("Personalize your app appearance")}
                    </h3>
                </div>
                <div className={styles.buttons}>
                    {isEditing ? (
                        <>
                            <ButtonFour onClick={handleCancel}>
                                {t("Cancel")}
                            </ButtonFour>
                            <ButtonOne type="submit" disabled={isLoading}>
                                <LoadableButtonContent isLoading={isLoading} buttonLabel={t("Save")} />
                            </ButtonOne>
                        </>
                    ) : (
                        <ButtonOne onClick={() => { setIsEditing(true); setIsLoading(false); }}>{t("Edit")}</ButtonOne>
                    )}
                </div>
            </div>

            <div className={styles.inputList}>
                <Switch
                    label={t("Dark Mode")}
                    checked={formData.isDarkMode}
                    onChange={() => handleToggle("isDarkMode")}
                    disabled={!isEditing}
                />

                <Switch
                    label={t("High Contrast Mode")}
                    checked={formData.isHighContrastMode}
                    onChange={() => handleToggle("isHighContrastMode")}
                    disabled={!isEditing}
                />

                <div className={styles.settingItem}>
                    <label className={`${styles.label} ${headerFont.className}`}>{t("Language")}</label>

                    <SelectDropdown
                        value={formData.language}
                        options={LANGUAGE_OPTIONS}
                        onChange={handleLanguageChange}
                        disabled={!isEditing}
                        ariaLabel={t("Language")}
                    />
                </div>

                <div className={styles.settingItem}>
                    <label className={`${styles.label} ${headerFont.className}`}>
                        {t("Corner Style")}
                    </label>

                    <SelectDropdown
                        value={formData.borderRadius}
                        options={borderRadiusOptions}
                        onChange={handleBorderRadiusChange}
                        disabled={!isEditing}
                        ariaLabel={t("Corner Style")}
                    />
                </div>
            </div>
        </form>
    );
}
