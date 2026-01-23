import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FinançasPro",
  description: "Controle financeiro familiar",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen bg-noir-bg-primary text-noir-text-body font-sans pb-20 md:pb-0">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6">
              <div className="max-w-5xl mx-auto">{children}</div>
            </main>
            <MobileNav />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
