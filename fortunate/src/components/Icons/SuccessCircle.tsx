import type React from "react";

export function SuccessCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth={1.2} />
      <polyline
        points="4.5,8.5 7,11 11.5,5.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
