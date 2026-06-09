import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap autogenerado.
 *
 * Solo rutas indexables. 404 y error.tsx no son rutas reales y no se incluyen.
 *
 * hreflang: el sitio está preparado para multi-idioma (next-intl). Aunque
 * en fase 1 solo existe `es`, declaramos `alternates.languages` con `es` y
 * `x-default` apuntando a la misma URL; cuando se añada `en` basta con
 * sumar la entrada aquí.
 */

const LAST_MODIFIED = "2026-06-08";

/** Rutas estáticas con su prioridad relativa. */
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/juegos", priority: 0.9, changeFrequency: "weekly" },
  { path: "/estudio", priority: 0.7, changeFrequency: "monthly" },
  { path: "/press", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contacto", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" },
  { path: "/aviso-legal", priority: 0.2, changeFrequency: "yearly" },
];

function localized(path: string) {
  const url = `${SITE_URL}/es${path}`;
  return {
    url,
    lastModified: LAST_MODIFIED,
    alternates: {
      languages: {
        es: url,
        "x-default": url,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map((s) => ({
    ...localized(s.path),
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const gameEntries = GAMES.map((g) => ({
    ...localized(`/juegos/${g.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...gameEntries];
}
