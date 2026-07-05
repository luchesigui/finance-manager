import type React from "react";

export function Pencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <path
        d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
