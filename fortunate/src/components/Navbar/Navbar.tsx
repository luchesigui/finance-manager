"use client";

import clsx from "clsx";
import type React from "react";
import { Logo } from "../Icons";
import styles from "./Navbar.module.css";

export interface NavbarItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  userName?: string;
  userInitial?: string;
  scrolled?: boolean;
  items?: NavbarItem[];
  // Permite injetar next/link no app mantendo o componente Next-free no Storybook
  linkComponent?: React.ElementType;
}

export function Navbar({
  userName = "Luche Silva",
  userInitial = "L",
  scrolled = false,
  items = [],
  linkComponent: LinkComponent = "a",
}: NavbarProps) {
  return (
    <header className={clsx(styles.header, { [styles.scrolled]: scrolled })}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Logo className={styles.logo} />
          <span className={styles.brandName}>Fortunate</span>
        </div>
        {items.length > 0 && (
          <div className={styles.nav}>
            {items.map((item) => (
              <LinkComponent
                key={item.href}
                href={item.href}
                className={clsx(styles.navLink, { [styles.navLinkActive]: item.active })}
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
              </LinkComponent>
            ))}
          </div>
        )}
        <div className={styles.profile}>
          <span className={styles.avatar}>{userInitial}</span>
          <span className={styles.userName}>{userName}</span>
        </div>
      </nav>
      {/* Container para o portal do resumo */}
      <div id="navbar-summary-portal" className={styles.summaryContainer} />
    </header>
  );
}
