"use client";

import {
  AppWindow,
  Banknote,
  CirclePoundSterling,
  KeySquare,
  LucideIcon,
  Trash2,
  TriangleAlert,
  User,
} from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/app/context/LanguageProvider";
import { headerFont } from "@/app/localFonts";

import styles from "./SettingsNav.module.css";

interface ISettingsLink {
  name: string;
  route: string;
  icon: LucideIcon;
  destructive?: boolean;
}

interface ISettingsNavProps {
  activeSetting: string;
}

const settingsLinks: ISettingsLink[] = [
  { name: "App", route: "/user/settings/app", icon: AppWindow },
  { name: "User", route: "/user/settings/user", icon: User },
  { name: "Password", route: "/user/settings/password", icon: KeySquare },
  { name: "Billing", route: "/user/settings/billing", icon: Banknote },
  {
    name: "AI Credits",
    route: "/user/settings/aiCredits",
    icon: CirclePoundSterling,
  },
  {
    name: "Delete Account",
    route: "/user/settings/deleteUser",
    icon: TriangleAlert,
    destructive: true,
  },
];

export default function SettingsNav({ activeSetting }: ISettingsNavProps) {
  const { t } = useLanguage();

  return (
    <nav className={styles.settingsNav}>
      <ul className={styles.settingsNavList}>
        {settingsLinks.map((link) => (
          <li key={link.route}>
            <Link
              href={link.route}
              className={`${styles.navItem} ${headerFont.className} ${link.destructive ? styles.destructiveItem : ""} ${activeSetting === link.name ? (link.destructive ? styles.activeDestructiveItem : styles.activeItem) : ""}`}
              aria-current={activeSetting === link.name ? "page" : undefined}
            >
              <link.icon aria-hidden="true" />
              {t(link.name)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
