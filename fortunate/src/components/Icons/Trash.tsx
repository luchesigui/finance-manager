import type React from "react";

export function Trash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <path
        d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
