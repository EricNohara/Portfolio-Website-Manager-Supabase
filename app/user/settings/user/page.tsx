"use client";

import { Settings } from "lucide-react";

import SettingsContentWithNav from "@/app/components/Navigation/SettingsNav/SettingsContentWithNav";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";

import EditUserForm from "./EditUserForm";
import styles from "./EditUserForm.module.css"


export default function UserSettingsPage() {
    return (
        <PageContentWrapper>
            <PageContentHeader title="Settings" icon={Settings} className={styles.noMargin} />
            <SettingsContentWithNav activeSetting="User">
                <EditUserForm />
            </SettingsContentWithNav>
        </PageContentWrapper>
    );
}
