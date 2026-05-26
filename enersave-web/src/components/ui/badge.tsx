import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "info" | "destructive";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variant === "default" && "bg-muted text-foreground",
        variant === "success" && "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
        variant === "warning" && "bg-amber-500/15 text-amber-200 border border-amber-500/25",
        variant === "info" && "bg-blue-500/15 text-blue-300 border border-blue-500/25",
        variant === "destructive" && "bg-red-500/15 text-red-200 border border-red-500/25",
        className
      )}
      {...props}
    />
  );
}
