import type React from "react";

export function Close(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <line
        x1={1.5}
        y1={1.5}
        x2={8.5}
        y2={8.5}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={8.5}
        y1={1.5}
        x2={1.5}
        y2={8.5}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
