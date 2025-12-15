import { FinanceProvider } from "@/components/finance/FinanceProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto min-h-screen flex flex-col">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </FinanceProvider>
  );
}
