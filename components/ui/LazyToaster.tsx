"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("@/components/ui/Toaster").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  return <Toaster />;
}
