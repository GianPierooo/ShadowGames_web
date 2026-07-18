import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-sans font-medium whitespace-nowrap",
    // CRAFT (Fase 2): transición completa (color + fondo + borde + sombra +
    // transform) con la curva estándar del sistema, en vez de solo color.
    "transition [transition-timing-function:var(--ease-standard)] duration-200",
    // Press sutil: solo si el usuario NO pidió reducir movimiento.
    "motion-safe:active:scale-[0.98]",
    // Foco de marca: ring violeta brillante (accent-hover) con gap al fondo.
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // CTA: fondo violeta deep (--accent-deep = #6d4ad6 dark / #4d2faa light)
        // → texto blanco a 5.8:1+ (AA). El "pop" viene de glow + peso + brillo en
        // hover, manteniendo la marca violeta (sin color de acción cálido).
        solid:
          "bg-[var(--accent-deep)] text-white font-semibold shadow-[var(--shadow-glow)] hover:brightness-110 hover:shadow-[0_0_70px_-6px_var(--accent)]",
        outline:
          "border border-[var(--accent)]/40 text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
        ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)]",
        pill:
          "border border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text)] backdrop-blur hover:border-[var(--accent)]/60 hover:bg-[var(--surface)]",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-pill)]",
        md: "h-11 px-6 text-base rounded-[var(--radius-pill)]",
        lg: "h-13 px-8 text-lg rounded-[var(--radius-pill)]",
        icon: "size-11 rounded-full", /* 44×44px — touch target mínimo */
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
