import type React from "react";

export function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M8 1.5L14.5 13.5H1.5L8 1.5Z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1={8}
        y1={6}
        x2={8}
        y2={9.5}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={8} cy={11.5} r={0.75} fill="currentColor" />
    </svg>
  );
}
