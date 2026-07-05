import * as cheerio from "cheerio";
import type { Jam, JamHost } from "../types";
import { addDaysIso, fetchText, parseCount, parseDurationDays } from "./_shared";

/**
 * itch.io NO tiene API de jams → scrapeamos el HTML server-rendered de
 * /jams/upcoming y /jams/in-progress.
 *
 * El listado NO incluye premio/tema/política de IA: eso vive en la página de
 * detalle y se resuelve en la Fase 4 (enriquecimiento LLM). Aquí quedan
 * null/unknown.
 */
const PAGES: { url: string; phase: "upcoming" | "in-progress" }[] = [
  { url: "https://itch.io/jams/upcoming", phase: "upcoming" },
  { url: "https://itch.io/jams/in-progress", phase: "in-progress" },
];

export async function fetchItchJams(): Promise<Jam[]> {
  const bySlug = new Map<string, Jam>();
  const errors: string[] = [];

  for (const page of PAGES) {
    try {
      const html = await fetchText(page.url);
      for (const jam of parseItchList(html, page.phase)) {
        // dedup por slug (una jam puede colarse en ambas páginas)
        if (!bySlug.has(jam.sourceId)) bySlug.set(jam.sourceId, jam);
      }
    } catch (err) {
      errors.push(`${page.url}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Si no obtuvimos nada Y hubo errores, propagamos para que el reporte lo refleje.
  if (bySlug.size === 0 && errors.length > 0) {
    throw new Error(errors.join(" | "));
  }
  return [...bySlug.values()];
}

/**
 * Parsea el HTML del listado de itch a Jam[] (función PURA, sin red → testeable
 * con fixtures). `fetchItchJams` la llama tras descargar cada página.
 */
export function parseItchList(
  html: string,
  phase: "upcoming" | "in-progress" = "upcoming",
): Jam[] {
  const $ = cheerio.load(html);
  const out: Jam[] = [];

  $("div.jam.lazy_images").each((_, el) => {
    const $el = $(el);

    const link = $el.find(".primary_info h3 a").first();
    const title = link.text().trim();
    const href = link.attr("href") ?? "";
    const slug = href.match(/\/jam\/([^/?#]+)/)?.[1];
    if (!title || !slug) return;

    const hosts: JamHost[] = [];
    $el.find(".hosted_by a").each((__, a) => {
      const name = $(a).text().trim();
      const url = $(a).attr("href")?.trim();
      if (name) hosts.push(url ? { name, url } : { name });
    });

    // La fecha ISO está en el texto del span.date_countdown (con Z);
    // fallback al atributo title="YYYY-MM-DD HH:MM:SS" (UTC).
    const countdown = $el.find(".date_countdown").first();
    const isoText = countdown.text().trim();
    const isoTitle = countdown.attr("title")?.trim();
    const parsed = normalizeIso(isoText) ?? normalizeIso(isoTitle);
    if (!parsed) return;

    // "Starts in …" vs "Ends in …" está en el <strong> contenedor.
    const phaseText = countdown.closest("strong").text().toLowerCase();
    const isEnd = /ends?\s+in|ends?\b/.test(phaseText)
      ? true
      : /starts?\s+in|starts?\b/.test(phaseText)
        ? false
        : phase === "in-progress";

    const durationDays = parseDurationDays($el.find(".date_duration").first().text());

    let startAt: string | null;
    let endAt: string | null;
    if (isEnd) {
      endAt = parsed;
      startAt = durationDays != null ? addDaysIso(parsed, -durationDays) : null;
    } else {
      startAt = parsed;
      endAt = durationDays != null ? addDaysIso(parsed, durationDays) : null;
    }

    const participants = parseCount(
      $el.find(".jam_stats .stat .number").first().text(),
    );

    out.push({
      source: "itch",
      sourceId: slug,
      url: `https://itch.io/jam/${slug}`,
      title,
      hosts,
      startAt,
      endAt,
      durationDays,
      theme: null,
      tags: [],
      languages: [],
      hasPrize: null,
      prizeSummary: null,
      prizeValueUsd: null,
      aiPolicy: "unknown",
      mode: "online",
      participants,
      country: null,
      ranked: $el.find(".jam_ranked").length > 0,
      featured: $el.find(".featured_flag").length > 0,
      enrichmentConfidence: 0.3,
    });
  });

  return out;
}

/** Normaliza un texto de fecha itch a ISO UTC, o null si no parsea. */
function normalizeIso(raw: string | undefined): string | null {
  if (!raw) return null;
  // "2026-07-22 17:00:00" (title, sin zona) → asumir UTC.
  const candidate = /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(raw)
    ? raw.includes("T") || raw.endsWith("Z")
      ? raw
      : `${raw.replace(" ", "T")}Z`
    : raw;
  const ms = Date.parse(candidate);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}
