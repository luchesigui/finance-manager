import type React from "react";

export function ArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
