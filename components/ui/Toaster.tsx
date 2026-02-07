"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "noir-card border border-noir-border bg-noir-primary text-body",
          title: "text-heading font-medium",
          success: "border-green-500/30 bg-green-500/5",
        },
      }}
    />
  );
}
