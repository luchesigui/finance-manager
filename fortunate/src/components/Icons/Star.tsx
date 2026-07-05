import type React from "react";

export function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" {...props}>
      <polygon points="5,0 6.2,3.8 10,3.8 6.9,6.1 8.1,10 5,7.6 1.9,10 3.1,6.1 0,3.8 3.8,3.8" />
    </svg>
  );
}
