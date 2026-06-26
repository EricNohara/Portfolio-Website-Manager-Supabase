"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import BillingPage from "./BillingPage";
import styles from "./BillingPage.module.css";


export default function BillingSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="Billing">
                <BillingPage />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
