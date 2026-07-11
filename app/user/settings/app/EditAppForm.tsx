"use client";

import React, { useEffect, useState } from "react";

import LoadableButtonContent from "@/app/components/AsyncButtonWrapper/LoadableButtonContent/LoadableButtonContent";
import { ButtonOne, ButtonFour } from "@/app/components/Buttons/Buttons";
import SelectDropdown from "@/app/components/SelectDropdown/SelectDropdown";
import Switch from "@/app/components/Switch/Switch";
import { useToast } from "@/app/context/ToastProvider";
import { headerFont } from "@/app/localFonts";
import { applyTheme, getStoredTheme, Theme, setStoredTheme, BorderRadius, getStoredBorderRadius, applyBorderRadius, setStoredBorderRadius } from "@/utils/general/theme";

import styles from "./EditAppForm.module.css";

interface IAppSettings {
    isDarkMode: boolean;
    isHighContrastMode: boolean;
    language: string;
    borderRadius: BorderRadius;
}

interface ILanguage {
    value: string;
    label: string;
}

const DEFAULT_APP_SETTINGS: IAppSettings = {
    isDarkMode: false,
    isHighContrastMode: false,
    language: "English",
    borderRadius: "balanced"
};

const LANGUAGES: ILanguage[] = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Español" },
    { value: "French", label: "Français" },
    { value: "German", label: "Deutsch" },
    { value: "Japanese", label: "日本語" },
];

const BORDER_RADIUS_OPTIONS = [
    { value: "sharp", label: "Sharp" },
    { value: "balanced", label: "Balanced" },
    { value: "rounded", label: "Rounded" },
];

export default function EditAppForm() {
    const [formData, setFormData] = useState<IAppSettings>(DEFAULT_APP_SETTINGS);
    const [initialData, setInitialData] = useState<IAppSettings>(DEFAULT_APP_SETTINGS);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const toast = useToast();

    // Initialize from localStorage (or current DOM class)
    useEffect(() => {
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
        };

        setFormData(nextSettings);
        setInitialData(nextSettings);
    }, []);

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
        setFormData((prev) => ({
            ...prev,
            language: value,
        }));
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            setInitialData(formData);

            toast.success(
                "Success",
                "App settings updated successfully."
            );

            setIsEditing(false);
        } catch {
            toast.error("Error", "Error updating your app settings.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.inputForm} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
                <div className={styles.headerText}>
                    <h1 className={`${headerFont.className} ${styles.formTitle}`}>App Settings</h1>
                    <h3 className={`${styles.formSubtitle} ${headerFont.className}`}>
                        Personalize your app appearance
                    </h3>
                </div>
                <div className={styles.buttons}>
                    {isEditing ? (
                        <>
                            <ButtonFour onClick={handleCancel}>
                                Cancel
                            </ButtonFour>
                            <ButtonOne type="submit" disabled={isLoading}>
                                <LoadableButtonContent isLoading={isLoading} buttonLabel="Save" />
                            </ButtonOne>
                        </>
                    ) : (
                        <ButtonOne onClick={() => { setIsEditing(true); setIsLoading(false); }}>Edit</ButtonOne>
                    )}
                </div>
            </div>

            <div className={styles.inputList}>
                <Switch
                    label="Dark Mode"
                    checked={formData.isDarkMode}
                    onChange={() => handleToggle("isDarkMode")}
                    disabled={!isEditing}
                />

                <Switch
                    label="High Contrast Mode"
                    checked={formData.isHighContrastMode}
                    onChange={() => handleToggle("isHighContrastMode")}
                    disabled={!isEditing}
                />

                <div className={styles.settingItem}>
                    <label className={`${styles.label} ${headerFont.className}`}>Language</label>

                    <SelectDropdown
                        value={formData.language}
                        options={LANGUAGES}
                        onChange={handleLanguageChange}
                        disabled={!isEditing}
                        ariaLabel="Language"
                    />
                </div>

                <div className={styles.settingItem}>
                    <label className={`${styles.label} ${headerFont.className}`}>
                        Corner Style
                    </label>

                    <SelectDropdown
                        value={formData.borderRadius}
                        options={BORDER_RADIUS_OPTIONS}
                        onChange={handleBorderRadiusChange}
                        disabled={!isEditing}
                        ariaLabel="Corner Style"
                    />
                </div>
            </div>
        </form>
    );
}