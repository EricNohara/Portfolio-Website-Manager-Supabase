"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import styles from "./UserDropdown.module.css";

interface IUserDropdownInfo {
    portrait_url: string | null;
    name: string | null;
}

export default function UserDropdown() {
    const [userDropdownInfo, setUserDropdownInfo] = useState<IUserDropdownInfo>({ portrait_url: null, name: null });

    useEffect(() => {
        const fetcher = async () => {
            try {
                const res = await fetch("/api/internal/user", { method: "GET" });
                const data = await res.json();
                console.log(data.userData);
                if (!res.ok) throw new Error("Failed to retrieve experience data");
                setUserDropdownInfo(data.userData);
            } catch (err) {
                alert(err);
            }
        };

        fetcher();
    }, []);

    return (
        <div className={styles.container}>
            <Image
                src={userDropdownInfo.portrait_url ? userDropdownInfo.portrait_url : "/images/default-avatar.svg"}
                height={40}
                width={40}
                alt="User profile picture"
                className={styles.avatar}
            />
            <p className={styles.name}>{userDropdownInfo.name ? userDropdownInfo.name : "Default User"}</p>
            <ChevronDown />
        </div>
    );
}