import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "border-[#0e7490] bg-[#083344] text-[#67e8f9]",
        secondary: "border-[#374151] bg-[#111827] text-[#9ca3af]",
        success: "border-[#14532d] bg-[#052e16] text-[#86efac]",
        premium: "border-[#7c2d12] bg-[#431407] text-[#fdba74]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
