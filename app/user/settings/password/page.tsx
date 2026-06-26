"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import ResetPasswordForm from "./ResetPasswordForm";
import styles from "./ResetPasswordForm.module.css";


export default function PasswordSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="Password">
                <ResetPasswordForm />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
