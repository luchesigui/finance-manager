import type React from "react";

export function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <rect x={1} y={2.5} width={10} height={7} rx={1.2} stroke="currentColor" strokeWidth={1.1} />
      <line x1={1} y1={5} x2={11} y2={5} stroke="currentColor" strokeWidth={1.1} />
      <rect x={2.5} y={6.5} width={3} height={1.5} rx={0.4} fill="currentColor" opacity={0.6} />
    </svg>
  );
}
