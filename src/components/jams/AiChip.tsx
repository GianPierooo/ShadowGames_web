import type { AiPolicy } from "@/lib/jams/types";
import { cn } from "@/lib/cn";

/**
 * Chip de política de IA con TRES estados visualmente distintos:
 *  - allowed  → violeta   (estado secundario positivo)
 *  - banned   → rojo       (prohibición, salta a la vista)
 *  - unknown  → neutro     (sin definir)
 * Presentacional: recibe la etiqueta ya traducida.
 */
const STYLES: Record<AiPolicy, { box: string; dot: string }> = {
  allowed: {
    box: "border-violet/45 bg-violet/16 text-violet-soft",
    dot: "bg-violet",
  },
  banned: {
    box: "border-danger/48 bg-danger/14 text-danger-soft",
    dot: "bg-danger",
  },
  unknown: {
    box: "border-edge-strong bg-radar-surface-2 text-faint",
    dot: "bg-fainter",
  },
};

export function AiChip({
  policy,
  label,
}: {
  policy: AiPolicy;
  label: string;
}) {
  const s = STYLES[policy];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold leading-none",
        s.box,
      )}
    >
      <span aria-hidden className={cn("size-2 rounded-[2px]", s.dot)} />
      {label}
    </span>
  );
}
