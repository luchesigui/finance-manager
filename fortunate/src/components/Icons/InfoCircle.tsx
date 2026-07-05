import type React from "react";

export function InfoCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth={1.2} />
      <line
        x1={8}
        y1={7}
        x2={8}
        y2={11.5}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={8} cy={4.75} r={0.85} fill="currentColor" />
    </svg>
  );
}
