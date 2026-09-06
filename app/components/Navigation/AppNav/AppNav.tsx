"use client";

import { House, File, Briefcase, GraduationCap, Rocket, Brain, Settings, KeyRound, Bot, ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useLanguage } from "@/app/context/LanguageProvider";
import { headerFont } from "@/app/localFonts";

import styles from "./AppNav.module.css";
import TitleLogo from "../../TitleLogo/TitleLogo";

import type { LucideIcon } from "lucide-react";

interface INavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    regExpPath?: RegExp;
}

const navItems: INavItem[] = [
    { label: "Home", path: "/user", icon: House, },
    { label: "User Info", path: "/user/userInfo", icon: UserRound },
    { label: "Documents", path: "/user/documents", icon: File },
    { label: "Experience", path: "/user/experience", icon: Briefcase },
    { label: "Education", path: "/user/education", icon: GraduationCap, regExpPath: /^\/user\/education\/\d+\/course$/ },
    { label: "Projects", path: "/user/projects", icon: Rocket },
    { label: "Skills", path: "/user/skills", icon: Brain },
    { label: "API Keys", path: "/user/connect", icon: KeyRound },
    { label: "AI Agents", path: "/user/aiAgents", icon: Bot, regExpPath: /^\/user\/aiAgents(\/.*)?$/, }
];

export default function AppNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        setIsCollapsed(localStorage.getItem("app-nav-collapsed") === "true");
    }, []);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem("app-nav-collapsed", String(next));
            return next;
        });
    };

    const handleClick = (item: INavItem) => {
        router.push(item.path);
    };

    const visuallyCollapsed = hasMounted && isCollapsed;

    const renderNavButton = (item: INavItem) => {
        const Icon = item.icon;
        const isActive = item.regExpPath
            ? pathname === item.path || item.regExpPath.test(pathname)
            : pathname === item.path;

        return (
            <button
                key={item.path}
                onClick={() => handleClick(item)}
                className={`${styles.navButton} ${isActive ? styles.activeNavButton : ""} ${headerFont.className}`}
                title={visuallyCollapsed ? t(item.label) : undefined}
                aria-label={t(item.label)}
            >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{t(item.label)}</span>
            </button>
        );
    };

    return (
        <nav className={`${styles.navContainer} ${hasMounted && isCollapsed ? styles.collapsed : ""}`}>
            <button
                className={styles.collapseButton}
                onClick={toggleCollapsed}
                aria-label={t(visuallyCollapsed ? "Expand sidebar" : "Collapse sidebar")}
                title={t(visuallyCollapsed ? "Expand sidebar" : "Collapse sidebar")}
            >
                {visuallyCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <div className={styles.navSection}>
                <div className={styles.logoWrapper}>
                    <TitleLogo collapsed={visuallyCollapsed} />
                </div>

                {navItems.map(renderNavButton)}
            </div>

            <div className={styles.navSection}>
                <button
                    onClick={() => router.push("/user/settings/app")}
                    className={`${styles.navButton} ${headerFont.className} ${pathname.includes("/user/settings") ? styles.activeNavButton : ""
                        }`}
                    title={visuallyCollapsed ? t("Settings") : undefined}
                    aria-label={t("Settings")}
                >
                    <Settings className={styles.navIcon} />
                    <span className={styles.navLabel}>{t("Settings")}</span>
                </button>
            </div>
        </nav>
    );
}
