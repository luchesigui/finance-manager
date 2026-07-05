import clsx from "clsx";
import type React from "react";
import styles from "./Toast.module.css";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
}

const variantIcon: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <polyline
        points="4.5,8.5 7,11 11.5,5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <line
        x1="5"
        y1="5"
        x2="11"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="5"
        x2="5"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5L14.5 13.5H1.5L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="8"
        y1="6"
        x2="8"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <line
        x1="8"
        y1="7"
        x2="8"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.75" r="0.85" fill="currentColor" />
    </svg>
  ),
};

export function Toast({
  variant = "info",
  title,
  message,
  onDismiss,
  autoDismiss = false,
}: ToastProps) {
  return (
    <div className={clsx(styles.toast, styles[variant])} role="alert" aria-live="assertive">
      <div className={styles.icon} aria-hidden>
        {variantIcon[variant]}
      </div>

      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {message && <p className={styles.message}>{message}</p>}
      </div>

      {onDismiss && (
        <button className={styles.close} onClick={onDismiss} aria-label="Fechar notificação">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <line
              x1="1.5"
              y1="1.5"
              x2="8.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8.5"
              y1="1.5"
              x2="1.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {autoDismiss && <div className={styles.progress} aria-hidden />}
    </div>
  );
}
