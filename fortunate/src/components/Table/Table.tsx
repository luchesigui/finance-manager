import clsx from "clsx";
import type React from "react";
import styles from "./Table.module.css";

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface TableProps<T extends Record<string, any>> {
  columns: TableColumn<T>[];
  data: T[];
  maxLines?: number;
  onReadAllClick?: () => void;
  showCardBadge?: boolean;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  maxLines,
  onReadAllClick,
  showCardBadge,
}: TableProps<T>) {
  const visibleData = maxLines != null ? data.slice(0, maxLines) : data;
  const hasFade = maxLines != null && data.length > maxLines;

  const cardCol = showCardBadge
    ? ({
        key: "__cardBadge__" as keyof T,
        header: "",
        render: (_v: T[keyof T], row: T) =>
          (row as Record<string, unknown>).isCard ? (
            <span className={styles.cardBadge}>💳</span>
          ) : null,
      } as TableColumn<T>)
    : null;

  const effectiveColumns = cardCol ? [cardCol, ...columns] : columns;

  return (
    <div className={styles.tableContainer}>
      <div className={clsx(styles.responsive, { [styles.withFade]: hasFade })}>
        <table className={styles.table}>
          <thead>
            <tr>
              {effectiveColumns.map((col, i) => (
                <th key={String(col.key) + i} className={styles.th}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, i) => (
              <tr key={i} className={styles.row}>
                {effectiveColumns.map((col, j) => (
                  <td key={String(col.key) + j} className={styles.td}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onReadAllClick && (
        <button className={styles.viewAllBtn} onClick={onReadAllClick}>
          Ver todas as transações
        </button>
      )}
    </div>
  );
}
