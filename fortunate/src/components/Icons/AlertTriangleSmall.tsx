import type React from "react";

export function AlertTriangleSmall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path
        d="M6 1.5L10.5 10.5H1.5L6 1.5Z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <line
        x1={6}
        y1={5}
        x2={6}
        y2={7.5}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <circle cx={6} cy={9.5} r={0.6} fill="currentColor" />
    </svg>
  );
}
