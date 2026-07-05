import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipTone = "ember" | "violet" | "neutral" | "danger";

const TONE_ACTIVE: Record<ChipTone, string> = {
  ember: "border-ember/50 bg-ember/15 text-ember",
  violet: "border-violet/50 bg-violet/16 text-violet-soft",
  neutral: "border-edge-strong bg-radar-surface-2 text-radar-text",
  danger: "border-danger/50 bg-danger/14 text-danger-soft",
};

const DOT: Record<ChipTone, string> = {
  ember: "bg-ember",
  violet: "bg-violet",
  neutral: "bg-fainter",
  danger: "bg-danger",
};

export interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  /** Renderiza el chip como <button> (toggle). */
  onClick?: () => void;
  /** Estado activo (para toggles). */
  active?: boolean;
  /** Muestra un punto de color a la izquierda. */
  dot?: boolean;
  /** Handler + botón "×" para quitar (chips de filtro activo). */
  onRemove?: () => void;
  /** Etiqueta accesible del botón de quitar. */
  removeLabel?: string;
  className?: string;
}

/**
 * Átomo "chip" reutilizable: sirve como toggle, como etiqueta de filtro activo
 * (con ×) o como pastilla estática. Target táctil ≥44px cuando es interactivo.
 */
export function Chip({
  children,
  tone = "neutral",
  onClick,
  active = false,
  dot = false,
  onRemove,
  removeLabel,
  className,
}: ChipProps) {
  const base = cn(
    "inline-flex items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
    onClick || onRemove ? "min-h-11" : "min-h-8 py-1.5",
    active || onRemove
      ? TONE_ACTIVE[tone]
      : "border-edge bg-radar-surface text-muted hover:border-edge-strong hover:text-radar-text",
    className,
  );

  const inner = (
    <>
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", DOT[tone])}
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }
          }}
          className="ml-0.5 grid size-5 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100"
        >
          <span aria-hidden>×</span>
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={base}
      >
        {inner}
      </button>
    );
  }

  return <span className={base}>{inner}</span>;
}
