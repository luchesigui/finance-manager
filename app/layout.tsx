import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/app/providers";
import { LazyToaster } from "@/components/ui/LazyToaster";
import { AppHeader } from "@/features/layout/components/AppHeader";
import { MainContent } from "@/features/layout/components/MainContent";
import { MobileNav } from "@/features/layout/components/MobileNav";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FinançasPro",
  description:
    "Gestão financeira estratégica: Health Score, divisão proporcional de despesas (Cerbasi), reserva de emergência e simulador de cenários.",
  applicationName: "FinançasPro",
  keywords: [
    "finanças pessoais",
    "gestão financeira",
    "health score financeiro",
    "divisão de despesas",
    "reserva de emergência",
    "simulador financeiro",
    "Cerbasi",
    "casais inteligentes",
  ],
  openGraph: {
    title: "FinançasPro",
    description:
      "Gestão financeira estratégica: Health Score, divisão proporcional de despesas, reserva de emergência e simulador de cenários.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary",
    title: "FinançasPro",
    description:
      "Gestão financeira estratégica: Health Score, divisão proporcional de despesas, reserva de emergência e simulador de cenários.",
  },
};

// Required for Supabase auth - prevents static generation that fails without env vars
export const dynamic = "force-dynamic";

// Anti-flash script to prevent wrong theme flash on page load
const themeScript = `
  (function() {
    const stored = localStorage.getItem('theme');
    const theme = stored || 'system';
    let resolved = theme;

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolved);
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Inline script to prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-noir-primary text-body font-sans antialiased min-h-screen">
        {/* Skip link for keyboard navigation - accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                     noir-btn-primary z-50 focus:z-50"
        >
          Pular para conteúdo principal
        </a>
        <ThemeProvider>
          <Providers>
            <div className="min-h-screen pb-20 md:pb-0">
              <AppHeader />
              <MainContent>{children}</MainContent>
              <MobileNav />
            </div>
          </Providers>
        </ThemeProvider>
        <LazyToaster />
        <Analytics />
      </body>
    </html>
  );
}
