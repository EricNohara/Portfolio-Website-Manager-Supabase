"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { headerFont } from "@/app/localFonts";
import { DocumentationPage } from "@/utils/navigation/documentation";

import styles from "./ButtonListPopup.module.css";
import DocumentationLink from "../DocumentationLink/DocumentationLink";

type IBaseButton = {
    icon: LucideIcon;
    name: string;
};

type IButtonWithRoute = IBaseButton & {
    type: "route";
    route: string;
};

type IButtonWithAction = IBaseButton & {
    type: "action";
    action: () => void | Promise<void>;
};

type IButtonWithDocumentationLink = IBaseButton & {
    type: "documentation";
    documentationPage: DocumentationPage;
};

export type IButtonProp =
    | IButtonWithRoute
    | IButtonWithAction
    | IButtonWithDocumentationLink;

export interface IButtonListPopupProps {
    buttons: IButtonProp[];
}

export default function ButtonListPopup({
    buttons,
}: IButtonListPopupProps) {
    const router = useRouter();

    const handleClick = (button: IButtonWithRoute | IButtonWithAction) => {
        if (button.type === "route") {
            router.push(button.route);
            return;
        }

        void button.action();
    };

    return (
        <div className={styles.container}>
            {buttons.map((button) => {
                const Icon = button.icon;

                if (button.type === "documentation") {
                    return (
                        <DocumentationLink
                            key={button.name}
                            page={button.documentationPage}
                            className={styles.button}
                        >
                            <Icon aria-hidden="true" />

                            <p
                                className={`${styles.buttonName} ${headerFont.className}`}
                            >
                                {button.name}
                            </p>
                        </DocumentationLink>
                    );
                }

                return (
                    <button
                        key={button.name}
                        type="button"
                        className={styles.button}
                        onClick={() => handleClick(button)}
                    >
                        <Icon aria-hidden="true" />

                        <p
                            className={`${styles.buttonName} ${headerFont.className}`}
                        >
                            {button.name}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}