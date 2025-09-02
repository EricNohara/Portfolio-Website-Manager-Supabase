import styles from "./PageContentHeader.module.css";
import { ButtonOne, ButtonFour } from "../Buttons/Buttons";

export interface IButton {
    name: string;
    onClick: () => void;
}

export interface IPageContentHeaderProps {
    title: string;
    buttonOne: IButton;
    buttonFour?: IButton | null;
}

export default function PageContentHeader({ title, buttonOne, buttonFour }: IPageContentHeaderProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.buttons}>
                {buttonFour && <ButtonFour onClick={buttonFour.onClick}>{buttonFour.name}</ButtonFour>}
                <ButtonOne onClick={buttonOne.onClick}>{buttonOne.name}</ButtonOne>
            </div>
        </div>
    );
}