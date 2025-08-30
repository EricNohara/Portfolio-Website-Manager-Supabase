import { Trash, Pencil } from "lucide-react";

import styles from "./Table.module.css";
import { EditButton, DeleteButton } from "../Buttons/Buttons";

export interface ITableProps {
    columns: string[];
    rows: Array<Record<string, React.ReactNode>>;
    handleEdit: (rowIndex: number) => void;
    handleDelete: (rowIndex: number) => void;
}

export default function Table({ columns, rows, handleEdit, handleDelete }: ITableProps) {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={styles.th}>
                                {col}
                            </th>
                        ))}
                        <th className={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className={styles.tr}>
                            {columns.map((col) => (
                                <td key={col} className={styles.td}>
                                    {row[col]}
                                </td>
                            ))}
                            <td className={styles.actions}>
                                <EditButton onClick={() => handleEdit(i)}><Pencil /></EditButton>
                                <DeleteButton onClick={() => handleDelete(i)}><Trash /></DeleteButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}