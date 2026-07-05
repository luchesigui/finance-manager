import type React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M 16,33 C 14,35 24,47 28,49 C 29,49 20,38 16,33 Z" />
      <path d="M 50,15 C 52,18 52,38 50,45 C 48,38 48,18 50,15 Z" />
      <path d="M 84,33 C 80,38 71,49 72,49 C 76,47 86,35 84,33 Z" />
      <path d="M 5,56 C 25,54 75,54 95,56 C 80,58 45,59 5,56 Z" />
      <path d="M 18,63 C 12,75 30,92 50,92 C 70,92 88,75 82,63 C 86,75 70,96 50,96 C 30,96 14,75 18,63 Z" />
    </svg>
  );
}
