import type { JamSource } from "@/lib/jams/types";
import { SOURCE_META } from "@/lib/jams/labels";

/**
 * Badge de fuente: punto de color (del mapa `SOURCE_META`) + etiqueta.
 * Presentacional: el color y el texto vienen de `labels.ts`, no de la lógica.
 */
export function SourceBadge({ source }: { source: JamSource }) {
  const meta = SOURCE_META[source];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-edge bg-radar-surface-2 px-3 py-1.5 text-[12.5px] leading-none text-muted">
      <span
        aria-hidden
        className="size-[7px] rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}
