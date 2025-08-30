import { Trash, Pencil } from "lucide-react";

import styles from "./Table.module.css";
import { EditButton, DeleteButton } from "../Buttons/Buttons";

export interface ITableProps {
    columns: string[];
    rows: Array<Record<string, React.ReactNode>>;
    handleEdit: (rowIndex: number) => void;
    handleDelete: (rowIndex: number) => void;
    columnWidths?: number[];
}

export default function Table({ columns, rows, handleEdit, handleDelete, columnWidths }: ITableProps) {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={styles.th}
                                style={columnWidths ? { width: `${columnWidths[i]}%` } : undefined}
                            >
                                {col}
                            </th>
                        ))}
                        <th className={styles.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className={styles.tr}>
                            {columns.map((col, j) => (
                                <td
                                    key={col}
                                    className={styles.td}
                                    style={columnWidths ? { width: `${columnWidths[j]}%` } : undefined}
                                >
                                    {row[col]}
                                </td>
                            ))}
                            <td className={styles.actions}>
                                <EditButton onClick={() => handleEdit(i)}><Pencil size={20} strokeWidth={2} /></EditButton>
                                <DeleteButton onClick={() => handleDelete(i)}><Trash size={20} strokeWidth={2} /></DeleteButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}