import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-[#30363d] bg-[#1f2630] text-[#c9d1d9]",
        accent: "border-[#2f81f7]/40 bg-[#2f81f7]/15 text-[#79c0ff]",
        success: "border-[#3fb950]/30 bg-[#3fb950]/15 text-[#56d364]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
