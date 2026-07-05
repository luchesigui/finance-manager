import type React from "react";

export function Layers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path
        d="M1.5 4L6 2L10.5 4L6 6L1.5 4Z"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M1.5 6.5L6 8.5L10.5 6.5"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 9L6 11L10.5 9"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
