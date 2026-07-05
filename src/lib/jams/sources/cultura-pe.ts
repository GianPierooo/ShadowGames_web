import * as cheerio from "cheerio";
import type { Jam } from "../types";
import { fetchText } from "./_shared";

/**
 * Cultura PE (Ministerio de Cultura del Perú / DAFO): convocatorias con
 * financiamiento. Nos quedamos con TODOS los concursos de VIDEOJUEGO abiertos
 * (puede haber varias líneas), no sólo el principal. Abierto = lo dice el estado
 * o el "Cierre de Postulación: DD/MM/YYYY" (endAt, hora Perú UTC-5) aún no pasó.
 */
const PAGE_URL =
  "https://estimuloseconomicos.cultura.gob.pe/2026/estimulos-economicos-para-la-actividad-cinematografica-y-audiovisual-2026";

export async function fetchCulturaPeJams(): Promise<Jam[]> {
  const html = await fetchText(PAGE_URL);
  const $ = cheerio.load(html);
  const bySlug = new Map<string, Jam>();

  $('a[href*="/concursos/"]').each((_, a) => {
    const $a = $(a);
    const text = $a.text().replace(/\s+/g, " ").trim();
    const href = $a.attr("href");
    if (!href) return;

    // Todos los concursos de videojuego (varias líneas posibles).
    if (!/v[ií]deo\s?juegos?/i.test(text)) return;

    const endAt = parseCierre(text);
    if (!endAt) return;

    // Abierto: lo dice el estado, o el cierre aún no pasó (no mostramos cerrados).
    if (!/abierto/i.test(text) && Date.parse(endAt) < Date.now()) return;

    const slug = href.match(/\/concursos\/([^/?#]+)/)?.[1] ?? href;
    if (bySlug.has(slug)) return;

    const title =
      text
        .replace(/^\s*(abierto|cerrado|pr[oó]ximamente|en evaluaci[oó]n)\s*/i, "")
        .replace(/\s*cierre de postulaci[oó]n.*$/i, "")
        .trim() || "Concurso de videojuegos — Cultura PE";

    bySlug.set(slug, {
      source: "cultura-pe",
      sourceId: slug,
      url: absolute(href),
      title,
      hosts: [
        {
          name: "Ministerio de Cultura del Perú",
          url: "https://www.gob.pe/cultura",
        },
      ],
      startAt: null,
      endAt,
      durationDays: null,
      theme: null,
      tags: ["LatAm", "Convocatoria", "Perú"],
      languages: ["es"],
      hasPrize: true,
      prizeSummary: "Estímulo económico",
      prizeValueUsd: null,
      aiPolicy: "unknown",
      mode: "unknown",
      participants: null,
      country: "PE",
      ranked: false,
      featured: false,
      enrichmentConfidence: 0.55,
    });
  });

  return [...bySlug.values()];
}

/** "Cierre de Postulación: 31/07/2026" → ISO al final del día en hora Perú (UTC-5). */
function parseCierre(text: string): string | null {
  const m = text.match(/cierre de postulaci[oó]n:?\s*(\d{2})\/(\d{2})\/(\d{4})/i);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const ms = Date.parse(`${yyyy}-${mm}-${dd}T23:59:00-05:00`);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

function absolute(href: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  return `https://estimuloseconomicos.cultura.gob.pe${href.startsWith("/") ? "" : "/"}${href}`;
}
