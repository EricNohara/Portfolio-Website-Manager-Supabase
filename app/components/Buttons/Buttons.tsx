import styles from "./Buttons.module.css"
import { ReactNode } from "react"

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
}

export function ButtonOne({ children, onClick }: ButtonProps) {
    return <button className={styles.one} onClick={onClick}>{children}</button>
}

export function ButtonTwo({ children, onClick }: ButtonProps) {
    return <button className={styles.two} onClick={onClick}>{children}</button>
}

export function ButtonThree({ children, onClick }: ButtonProps) {
    return <button className={styles.three} onClick={onClick}>{children}</button>
}

export function EditButton({ children, onClick }: ButtonProps) {
    return <button className={styles.edit} onClick={onClick}>{children}</button>
}

export function DeleteButton({ children, onClick }: ButtonProps) {
    return <button className={styles.delete} onClick={onClick}>{children}</button>
}

export function ExitButton({ children, onClick }: ButtonProps) {
    return <button className={styles.exit} onClick={onClick}>{children}</button>
}