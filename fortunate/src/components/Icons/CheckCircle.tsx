import type React from "react";

export function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth={1.2} />
      <polyline
        points="4,7.5 6.2,9.5 10,5"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
