import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "FinançasPro",
  description: "Controle financeiro familiar",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 md:pb-0">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6">
              <div className="max-w-5xl mx-auto">{children}</div>
            </main>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
