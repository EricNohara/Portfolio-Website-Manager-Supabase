"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import EditAppForm from "./EditAppForm";
import styles from "./EditAppForm.module.css";


export default function AppSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="App">
                <EditAppForm />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
