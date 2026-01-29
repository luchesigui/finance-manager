"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isLanding) {
    return <main className="flex-1 flex flex-col min-h-screen">{children}</main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">{children}</div>
    </main>
  );
}
