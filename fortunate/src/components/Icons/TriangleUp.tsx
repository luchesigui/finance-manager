import type React from "react";

export function TriangleUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" {...props}>
      <polygon points="4,0 8,8 0,8" fill="currentColor" />
    </svg>
  );
}
