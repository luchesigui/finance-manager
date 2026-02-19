"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: {
      root: "h-4 w-7 ring-1 ring-offset-1",
      thumb: "h-3 w-3 data-[state=checked]:translate-x-3",
    },
    md: {
      root: "h-6 w-11 ring-2 ring-offset-2",
      thumb: "h-5 w-5 data-[state=checked]:translate-x-5",
    },
    lg: {
      root: "h-8 w-14 ring-2 ring-offset-2",
      thumb: "h-7 w-7 data-[state=checked]:translate-x-6",
    },
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-noir-border transition-colors outline-none ring-accent-primary ring-offset-noir-surface disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent-primary data-[state=unchecked]:bg-noir-active",
        sizeClasses[size].root,
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
          sizeClasses[size].thumb,
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
