import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { AppNavbar } from "./AppNavbar";

export const metadata: Metadata = {
  title: "Fortunate",
  description: "Gestão financeira do casal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <AppNavbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
