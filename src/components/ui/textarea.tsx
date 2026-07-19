import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Textarea primitiva. Mismo estilo que `<Input>`. Resize vertical permitido.
 */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 6, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "block w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3",
        "font-sans text-base leading-relaxed text-[var(--text)] placeholder:text-[var(--text-subtle)]",
        // Foco marca (Fase 2): mismo lenguaje que <Input> — ring de acento
        // animado con la curva/duración del sistema.
        "resize-y transition-[color,border-color,box-shadow,background-color] duration-[var(--dur-fast)] [transition-timing-function:var(--ease-standard)]",
        "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30",
        "aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:focus-visible:ring-[var(--danger)]/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
