import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        released:
          "border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-bright)]",
        "early-access":
          "border border-amber-500/40 bg-amber-500/10 text-amber-300",
        "in-development":
          "border border-sky-500/40 bg-sky-500/10 text-sky-300",
        "coming-soon":
          "border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-muted)]",
        neutral:
          "border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
