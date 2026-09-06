"use client";

import { usePathname } from "next/navigation";

import styles from "./BodyWrapper.module.css";

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const wrapperClass = pathname === "/" ? styles.landing : styles.app;

    return (
        <div className={wrapperClass}>
            {children}
        </div>
    );
}
