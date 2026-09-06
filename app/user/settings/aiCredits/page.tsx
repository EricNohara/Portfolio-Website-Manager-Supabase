"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import AiCreditsPage from "./AiCreditsPage";
import styles from "./AiCreditsPage.module.css";

export default function AiCreditsSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="AI Credits">
                <AiCreditsPage />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
