import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** Input base con estética penumbra. Altura 44px. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-edge bg-radar-surface px-4",
        "text-sm text-radar-text placeholder:text-faint",
        "transition-colors hover:border-edge-strong focus:border-edge-strong",
        className,
      )}
      {...props}
    />
  );
}
