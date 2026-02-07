"use client";

import { usePathname } from "next/navigation";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();

  // Landing page and login page have their own full-screen layouts
  if (pathname === "/" || pathname === "/entrar" || pathname === "/signup") {
    return <>{children}</>;
  }

  // Regular app pages get the standard layout wrapper
  return (
    <main id="main-content" className="flex-1 p-4 md:p-6" tabIndex={-1}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </main>
  );
}
