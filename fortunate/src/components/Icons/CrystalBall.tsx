import type React from "react";

export function CrystalBall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <circle cx={6} cy={5.5} r={4.5} stroke="currentColor" strokeWidth={1.1} />
      <circle cx={6} cy={5.5} r={4.5} fill="currentColor" opacity={0.1} />
      <circle cx={4.2} cy={3.8} r={1.1} fill="currentColor" opacity={0.5} />
      <path d="M4 10.5 L8 10.5" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M6 10 L6 10.5" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}
