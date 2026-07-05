"use client";

import React from "react";
import { Toast, type ToastVariant } from "./Toast";

interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  message?: string;
}

interface ToastEntry extends ToastOptions {
  id: number;
}

const ToastContext = React.createContext<(options: ToastOptions) => void>(() => {});

const AUTO_DISMISS_MS = 4000;

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const nextId = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { ...options, id }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxWidth: "min(380px, calc(100vw - 3rem))",
          }}
        >
          {toasts.map((t) => (
            <Toast
              key={t.id}
              variant={t.variant}
              title={t.title}
              message={t.message}
              onDismiss={() => dismiss(t.id)}
              autoDismiss
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
