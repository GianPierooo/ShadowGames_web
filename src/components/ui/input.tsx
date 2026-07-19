import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Input primitivo del estudio.
 *
 * Estilo sobrio: fondo `--surface`, border hairline, focus ring violeta
 * marca. Sin iconos dentro (decisión PRINCIPLES). El tamaño `h-12` y
 * el padding cumplen 44px de touch target.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "block h-12 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-4",
          "font-sans text-base text-[var(--text)] placeholder:text-[var(--text-subtle)]",
          // Foco marca (Fase 2): borde + ring de acento que se funden con la
          // curva y duración del sistema (antes transition-colors no animaba
          // el ring, que es box-shadow).
          "transition-[color,border-color,box-shadow,background-color] duration-[var(--dur-fast)] [transition-timing-function:var(--ease-standard)]",
          "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30",
          "aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:focus-visible:ring-[var(--danger)]/30",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
