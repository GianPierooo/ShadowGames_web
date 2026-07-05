import type { Jam } from "../types";
import { fetchJson } from "./_shared";

/**
 * Alakajam! — comunidad indie internacional que organiza jams periódicas (la
 * "Alakajam!" de fin de semana, "Kajam" de un mes, tournaments…). Expone una API
 * JSON pública y estable: https://alakajam.com/api/event
 *
 * Sólo emitimos ediciones VIGENTES (con fecha de fin parseable en el futuro y
 * estado != closed). Si no hay ninguna programada, devolvemos [] (no inventamos
 * fechas). Cuando anuncien la próxima, aparece sola.
 */
const API_EVENTS = "https://alakajam.com/api/event";

interface AkjEvent {
  id: number;
  name?: string;
  title?: string;
  display_dates?: string;
  display_theme?: string;
  status?: string; // "pending" | "open" | "closed"
  started_at?: string;
  url?: string;
}

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Parsea el `display_dates` de Alakajam a {startAt, endAt} ISO UTC.
 * Soporta "14-16 November 2025" y "8 August - 22 August 2025". null si no parsea
 * (p. ej. "Dates to be confirmed").
 */
function parseDisplayDates(s: string): { startAt: string | null; endAt: string | null } {
  const utc = (y: number, mo: number, d: number, endOfDay = false) =>
    new Date(Date.UTC(y, mo, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, 0)).toISOString();

  // "14-16 November 2025"
  const same = s.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (same) {
    const mo = MONTHS[same[3]!.toLowerCase()];
    if (mo === undefined) return { startAt: null, endAt: null };
    const y = Number(same[4]);
    return { startAt: utc(y, mo, Number(same[1])), endAt: utc(y, mo, Number(same[2]), true) };
  }

  // "8 August - 22 August 2025" (posible cambio de mes)
  const cross = s.match(/(\d{1,2})\s+([A-Za-z]+)\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (cross) {
    const mo1 = MONTHS[cross[2]!.toLowerCase()];
    const mo2 = MONTHS[cross[4]!.toLowerCase()];
    if (mo1 === undefined || mo2 === undefined) return { startAt: null, endAt: null };
    const y = Number(cross[5]);
    return { startAt: utc(y, mo1, Number(cross[1])), endAt: utc(y, mo2, Number(cross[3]), true) };
  }

  return { startAt: null, endAt: null };
}

export async function fetchAlakajamJams(): Promise<Jam[]> {
  const events = await fetchJson<AkjEvent[]>(API_EVENTS, { timeoutMs: 10000 });
  return parseAlakajamEvents(events);
}

/**
 * Parsea la lista de eventos de la API de Alakajam a Jam[] (función PURA, sin red
 * → testeable con fixtures). `nowMs` inyectable para deterministas (default: ahora).
 */
export function parseAlakajamEvents(
  events: AkjEvent[],
  nowMs: number = Date.now(),
): Jam[] {
  const now = nowMs;
  const out: Jam[] = [];
  let skippedTbd = 0;

  for (const e of Array.isArray(events) ? events : []) {
    if (e.status === "closed") continue;
    const { startAt, endAt } = parseDisplayDates(e.display_dates ?? "");
    if (!endAt) {
      skippedTbd++;
      continue; // "Dates to be confirmed" → no emitimos fechas inventadas
    }
    if (Date.parse(endAt) < now) continue; // ya pasó

    const name = e.name ?? String(e.id);
    out.push({
      source: "alakajam",
      sourceId: name,
      url: e.url ?? `https://alakajam.com/${name}`,
      title: e.title ?? name,
      hosts: [{ name: "Alakajam!", url: "https://alakajam.com" }],
      startAt,
      endAt,
      durationDays: startAt
        ? Math.round((Date.parse(endAt) - Date.parse(startAt)) / 86_400_000)
        : null,
      theme: e.display_theme?.trim() || null,
      tags: ["Comunidad", "Ranking"],
      languages: ["en"],
      hasPrize: false,
      prizeSummary: null,
      prizeValueUsd: null,
      aiPolicy: "unknown",
      mode: "online",
      participants: null,
      country: null,
      ranked: true,
      featured: false,
      enrichmentConfidence: 0.55,
    });
  }

  if (out.length === 0) {
    console.log(
      `[alakajam] sin edición vigente (revisados ${Array.isArray(events) ? events.length : 0}; ${skippedTbd} sin fecha confirmada).`,
    );
  }
  return out;
}
