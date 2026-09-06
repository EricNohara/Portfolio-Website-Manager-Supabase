"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import DeleteUserPage from "./DeleteUserPage";
import styles from "./DeleteUserPage.module.css";

export default function DeleteUserSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="Delete Account">
                <DeleteUserPage />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
