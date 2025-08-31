import { useState } from "react";
import styles from "./ImportForm.module.css";
import { ButtonOne, ExitButton } from "../Buttons/Buttons";
import TextInput from "../TextInput/TextInput";
import { ChangeEvent } from "react";
import { X } from "lucide-react";

export interface IInputFormInput {
    label: string;
    name: string;
    value: string;
    type: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

export interface IInputFormRow {
    inputOne: IInputFormInput;
    inputTwo: IInputFormInput | null;
}

export interface IInputFormProps {
    inputRows: IInputFormRow[];
    title: string;
    buttonLabel: string;
    handleSubmit: () => void;
}

export default function InputForm({ inputRows, title, buttonLabel, handleSubmit }: IInputFormProps) {
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                <ExitButton><X size={15} /></ExitButton>
            </header>
            <div className={styles.inputRowsContainer}>
                {inputRows.map((row) => (
                    row.inputTwo ?
                        <div className={styles.splitInputRow}>
                            <TextInput
                                label={row.inputOne.label}
                                name={row.inputOne.name}
                                value={row.inputOne.value}
                                type={row.inputOne.type}
                                placeholder={row.inputOne.placeholder}
                                onChange={row.inputOne.onChange}
                                required={row.inputOne.required}
                            />
                            <TextInput
                                label={row.inputTwo.label}
                                name={row.inputTwo.name}
                                value={row.inputTwo.value}
                                type={row.inputTwo.type}
                                placeholder={row.inputTwo.placeholder}
                                onChange={row.inputTwo.onChange}
                                required={row.inputTwo.required}
                            />
                        </div>
                        : <TextInput
                            label={row.inputOne.label}
                            name={row.inputOne.name}
                            value={row.inputOne.value}
                            type={row.inputOne.type}
                            placeholder={row.inputOne.placeholder}
                            onChange={row.inputOne.onChange}
                            required={row.inputOne.required}
                        />
                ))}
            </div>
            <ButtonOne type="submit">{buttonLabel}</ButtonOne>
        </form>
    );
}