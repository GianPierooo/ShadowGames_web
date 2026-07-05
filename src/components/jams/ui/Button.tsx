import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "subtle" | "ghost";

const VARIANTS: Record<Variant, string> = {
  // Acento brasa para CTAs / acciones destacadas.
  primary:
    "border border-ember/50 bg-ember/15 text-ember hover:bg-ember/25 hover:border-ember/70",
  // Superficie discreta.
  subtle:
    "border border-edge bg-radar-surface text-radar-text hover:bg-radar-surface-2 hover:border-edge-strong",
  // Sin caja, sólo texto.
  ghost: "border border-transparent text-muted hover:text-radar-text hover:bg-radar-surface",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Botón base. Target táctil ≥44px (min-h-11) por defecto. */
export function Button({
  variant = "subtle",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4",
        "text-sm font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
