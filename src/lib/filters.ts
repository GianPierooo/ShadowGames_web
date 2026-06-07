import type { GameStatus } from "@/lib/games";

/**
 * Slugs en español para los `?estado=` de la URL. SEO local + URLs legibles.
 * Mantener sincronizado con `Status` en `messages/es.json`.
 */
export const STATUS_SLUG_TO_VALUE: Record<string, GameStatus> = {
  "disponible": "released",
  "early-access": "early-access",
  "en-desarrollo": "in-development",
  "proximamente": "coming-soon",
};

export const STATUS_VALUE_TO_SLUG: Record<GameStatus, string> = {
  "released": "disponible",
  "early-access": "early-access",
  "in-development": "en-desarrollo",
  "coming-soon": "proximamente",
};

export const STATUS_ORDER: GameStatus[] = [
  "released",
  "early-access",
  "in-development",
  "coming-soon",
];

/** Convierte "horror psicológico" → "horror-psicologico". */
export function slugifyGenre(genre: string): string {
  return genre
    .toLowerCase()
    .normalize("NFD")
    // Quitar diacríticos: \p{M} = todas las "Mark" (combining) de Unicode.
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Resuelve estado-slug → GameStatus, o `null` si "todos" / inválido. */
export function parseStatusParam(slug: string | undefined): GameStatus | null {
  if (!slug) return null;
  return STATUS_SLUG_TO_VALUE[slug] ?? null;
}

/** Resuelve género-slug → género canónico desde la lista, o `null`. */
export function parseGenreParam(
  slug: string | undefined,
  allGenres: string[],
): string | null {
  if (!slug) return null;
  const match = allGenres.find((g) => slugifyGenre(g) === slug);
  return match ?? null;
}
