/**
 * Constantes globales del sitio para SEO (canonical, sitemap, robots, JSON-LD).
 *
 * `SITE_URL` se toma de NEXT_PUBLIC_SITE_URL en producción (configúralo en
 * Vercel). El fallback es el dominio definitivo previsto.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shadowgames.studio"
).replace(/\/$/, "");

export const SITE_NAME = "Shadow Games";
export const SITE_LEGAL_NAME = "Shadow Games Studio";
export const SITE_LOCALE = "es";
export const PRESS_EMAIL = "shadowgames.devteam@gmail.com";

/** Construye una URL absoluta a partir de un path relativo (con prefijo de locale). */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/**
 * Devuelve el bloque `alternates` (canonical + hreflang) para una ruta.
 *
 * `path` es el path SIN prefijo de locale (p.ej. "/juegos" o "" para home).
 * Canonical y languages quedan con el prefijo `/es`. Cuando se añada `en`,
 * sumar la entrada en `languages`.
 */
export function routeAlternates(path: string) {
  const clean = path === "/" ? "" : path;
  const canonical = `/es${clean}`;
  return {
    canonical,
    languages: {
      es: canonical,
      "x-default": canonical,
    },
  };
}
