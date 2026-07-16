"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const safeValue = Math.min(Math.max(Number(value || 0), 0), 100);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-slate-200 relative h-2.5 w-full overflow-hidden rounded-full border border-slate-300 shadow-inner",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-500 ease-out bg-gradient-to-r from-[#0F2B5B] via-[#1D4ED8] to-[#16A34A]"
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
