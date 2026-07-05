"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { useSettings } from "@/hooks/useSettings";
import { useUsers } from "@/hooks/useUsers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Lançamentos", href: "/lancamentos" },
  { label: "Configurações", href: "/configuracoes" },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { users } = useUsers();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentUser = users.find((u) => u.id === settings?.defaultPayerId) ?? users[0];

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <Navbar
        userName={currentUser?.name ?? ""}
        userInitial={currentUser?.avatarInitials?.[0] ?? ""}
        scrolled={scrolled}
        linkComponent={Link}
        items={NAV_ITEMS.map((item) => ({
          ...item,
          active: item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
        }))}
      />
    </div>
  );
}
