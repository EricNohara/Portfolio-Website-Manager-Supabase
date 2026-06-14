import { LucideIcon } from "lucide-react";

import { headerFont } from "@/app/localFonts";

import styles from "./PageContentHeader.module.css";
import { AsyncButtonWrapper } from "../AsyncButtonWrapper/AsyncButtonWrapper";
import LoadableButtonContent from "../AsyncButtonWrapper/LoadableButtonContent/LoadableButtonContent";
import { ButtonOne, ButtonFour } from "../Buttons/Buttons";

export interface IButton {
    name: string;
    onClick?: () => void;
    isAsync?: boolean;
    type?: "button" | "submit";
    form?: string;          // form id to submit (works even outside form)
    disabled?: boolean;
    isLoading?: boolean;
    icon?: LucideIcon;
}

export interface IPageContentHeaderProps {
    title: string;
    buttonOne?: IButton;
    buttonFour?: IButton | null;
    className?: string;
}

export default function PageContentHeader({ title, buttonOne, buttonFour, className }: IPageContentHeaderProps) {
    return (
        <div className={`${styles.container} ${className ?? ""}`}>
            <h1 className={`${styles.title} ${headerFont.className}`}>{title}</h1>
            <div className={styles.buttons}>
                {buttonFour && (
                    (buttonFour.isAsync ?? false) ? (
                        <AsyncButtonWrapper
                            button={
                                <ButtonFour
                                    type={buttonFour.type ?? "button"}
                                    form={buttonFour.form}
                                    disabled={buttonFour.disabled}
                                    className={styles.button}
                                >
                                    {buttonFour.icon && <buttonFour.icon size={20} />}
                                    {
                                        buttonFour.isLoading ?
                                            <LoadableButtonContent isLoading={buttonFour.isLoading} buttonLabel={buttonFour.name} />
                                            : buttonFour.name
                                    }
                                </ButtonFour>
                            }
                            onClick={buttonFour.onClick ?? (() => { })}
                        />
                    ) : (
                        <ButtonFour
                            type={buttonFour.type ?? "button"}
                            form={buttonFour.form}
                            disabled={buttonFour.disabled}
                            onClick={buttonFour.onClick}
                            className={styles.button}
                        >
                            {buttonFour.icon && <buttonFour.icon size={20} />}
                            {buttonFour.name}
                        </ButtonFour>
                    )
                )}
                {buttonOne && (
                    (buttonOne.isAsync ?? false) ? (
                        <AsyncButtonWrapper
                            button={
                                <ButtonOne
                                    type={buttonOne.type ?? "button"}
                                    form={buttonOne.form}
                                    disabled={buttonOne.disabled}
                                    className={styles.button}
                                >
                                    {buttonOne.icon && <buttonOne.icon size={20} />}

                                    {
                                        buttonOne.isLoading ?
                                            <LoadableButtonContent isLoading={buttonOne.isLoading} buttonLabel={buttonOne.name} />
                                            : buttonOne.name
                                    }
                                </ButtonOne>
                            }
                            onClick={buttonOne.onClick ?? (() => { })}
                        />
                    ) : (
                        <ButtonOne
                            type={buttonOne.type ?? "button"}
                            form={buttonOne.form}
                            disabled={buttonOne.disabled}
                            onClick={buttonOne.onClick}
                            className={styles.button}
                        >
                            {buttonOne.icon && <buttonOne.icon size={20} />}
                            {buttonOne.name}
                        </ButtonOne>
                    )
                )}
            </div>
        </div>
    );
}