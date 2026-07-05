import type React from "react";

export function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth={1.2} />
      <line
        x1={5}
        y1={5}
        x2={11}
        y2={11}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={11}
        y1={5}
        x2={5}
        y2={11}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
