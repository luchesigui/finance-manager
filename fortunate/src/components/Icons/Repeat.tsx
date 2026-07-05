import type React from "react";

export function Repeat(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path
        d="M2.5 4.5C3.2 2.8 5 1.75 7 2C8.8 2.2 10 3.5 10.25 5"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5L10.25 5L7.5 4.5"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 7.5C8.8 9.2 7 10.25 5 10C3.2 9.8 2 8.5 1.75 7"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <path
        d="M2.5 9.5L1.75 7L4.5 7.5"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
