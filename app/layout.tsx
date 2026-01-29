import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainContent } from "@/components/layout/MainContent";
import { MobileNav } from "@/components/layout/MobileNav";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FinançasPro",
  description: "Controle financeiro familiar - Inspirado em Casais Inteligentes Enriquecem Juntos",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-noir-primary text-body font-sans antialiased">
        <Providers>
          <div className="min-h-screen pb-20 md:pb-0">
            <AppHeader />
            <MainContent>{children}</MainContent>
            <MobileNav />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
