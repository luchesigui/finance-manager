"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Navbar.module.css";

export interface NavbarProps {
  userName?: string;
  userInitial?: string;
  scrolled?: boolean;
}

const FortunateLogo = () => (
  <svg className={styles.logo} viewBox="0 0 100 100">
    <path className={styles.logoAll} d="M 16,33 C 14,35 24,47 28,49 C 29,49 20,38 16,33 Z" />
    <path className={styles.logoAll} d="M 50,15 C 52,18 52,38 50,45 C 48,38 48,18 50,15 Z" />
    <path className={styles.logoAll} d="M 84,33 C 80,38 71,49 72,49 C 76,47 86,35 84,33 Z" />
    <path className={styles.logoAll} d="M 5,56 C 25,54 75,54 95,56 C 80,58 45,59 5,56 Z" />
    <path
      className={styles.logoAll}
      d="M 18,63 C 12,75 30,92 50,92 C 70,92 88,75 82,63 C 86,75 70,96 50,96 C 30,96 14,75 18,63 Z"
    />
  </svg>
);

export function Navbar({
  userName = "Luche Silva",
  userInitial = "L",
  scrolled = false,
}: NavbarProps) {
  return (
    <nav className={clsx(styles.navbar, { [styles.scrolled]: scrolled })}>
      <div className={styles.brand}>
        <FortunateLogo />
        <span className={styles.brandName}>Fortunate</span>
      </div>
      <div className={styles.profile}>
        <span className={styles.avatar}>{userInitial}</span>
        <span className={styles.userName}>{userName}</span>
      </div>
    </nav>
  );
}
