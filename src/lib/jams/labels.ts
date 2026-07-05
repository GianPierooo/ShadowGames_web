import type { JamSource } from "./types";

/**
 * Mapa de presentación por fuente: etiqueta visible + color del punto del badge.
 * Vive SEPARADO de la lógica: renombrar o recolorear una fuente no toca el
 * filtrado ni los tipos. Los IDs (`JamSource`) siguen siendo la fuente de verdad.
 *
 * Los nombres son marcas (itch.io, Devpost, Ludum Dare), por eso no se traducen;
 * "cultura-pe" se muestra genéricamente como "Convocatoria".
 */
export interface SourceMeta {
  /** Etiqueta visible en el badge y en el filtro de fuente. */
  label: string;
  /** Color del punto — referencia a un token CSS (var(--source-*)). */
  dot: string;
}

export const SOURCE_META: Record<JamSource, SourceMeta> = {
  itch: { label: "itch.io", dot: "var(--source-itch)" },
  devpost: { label: "Devpost", dot: "var(--source-devpost)" },
  ludumdare: { label: "Ludum Dare", dot: "var(--source-ludumdare)" },
  alakajam: { label: "Alakajam!", dot: "var(--source-alakajam)" },
  globalgamejam: { label: "Global Game Jam", dot: "var(--source-globalgamejam)" },
  "cultura-pe": { label: "Convocatoria", dot: "var(--source-cultura-pe)" },
  "cva-pe": { label: "CVA Perú", dot: "var(--source-cva-pe)" },
};

/** Orden estable para pintar la lista de fuentes en los filtros. */
export const SOURCE_ORDER: JamSource[] = [
  "itch",
  "devpost",
  "ludumdare",
  "alakajam",
  "globalgamejam",
  "cultura-pe",
  "cva-pe",
];
