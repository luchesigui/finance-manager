import type React from "react";

export function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <rect x={1.5} y={2} width={9} height={8.5} rx={1.2} stroke="currentColor" strokeWidth={1.1} />
      <line x1={1.5} y1={5} x2={10.5} y2={5} stroke="currentColor" strokeWidth={1} />
      <line
        x1={4}
        y1={0.5}
        x2={4}
        y2={3}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={8}
        y1={0.5}
        x2={8}
        y2={3}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <circle cx={4} cy={7.5} r={0.8} fill="currentColor" />
      <circle cx={6} cy={7.5} r={0.8} fill="currentColor" />
      <circle cx={8} cy={7.5} r={0.8} fill="currentColor" />
    </svg>
  );
}
