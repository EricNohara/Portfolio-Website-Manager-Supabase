import styles from "./PageContentHeader.module.css";
import { ButtonOne } from "../Buttons/Buttons";

export interface IButton {
    name: string;
    onClick: () => void;
}

export interface IPageContentHeaderProps {
    title: string;
    buttonOne: IButton;
}

export default function PageContentHeader({ title, buttonOne }: IPageContentHeaderProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <ButtonOne onClick={buttonOne.onClick}>{buttonOne.name}</ButtonOne>
        </div>
    );
}