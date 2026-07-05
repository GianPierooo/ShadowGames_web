import type { Jam } from "../types";
import { fetchText } from "./_shared";

/**
 * Global Game Jam — el evento de game jam MÁS grande del mundo (miles de
 * participantes en sedes de decenas de países + online). Es anual (finales de
 * enero). No hay API pública, pero la home server-rendered publica las fechas de
 * la próxima edición: `Jam Dates</strong><br>25 - 31 January 2027`.
 *
 * Emitimos UNA sola jam (la próxima edición) si su fin está en el futuro. Si no
 * encontramos las fechas o ya pasó, devolvemos [] (no inventamos nada).
 */
const HOME = "https://globalgamejam.org/";

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

export async function fetchGlobalGameJamJams(): Promise<Jam[]> {
  const html = await fetchText(HOME, { timeoutMs: 12000 });

  // "Jam Dates</strong><br>25 - 31 January 2027" (tolerante a espacios/markup);
  // fallback: cualquier "DD - DD <Mes> 20XX" cerca del texto "Jam Dates".
  const near = html.match(
    /Jam\s*Dates<\/strong>\s*<br\s*\/?>\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/i,
  );
  const loose =
    near ??
    html.match(
      /(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})/i,
    );
  if (!loose) {
    console.warn("[globalgamejam] no encontré las fechas de la próxima edición en la home.");
    return [];
  }

  const mo = MONTHS[loose[3]!.toLowerCase()];
  if (mo === undefined) return [];
  const year = Number(loose[4]);
  const startAt = new Date(Date.UTC(year, mo, Number(loose[1]))).toISOString();
  const endAt = new Date(Date.UTC(year, mo, Number(loose[2]), 23, 59, 0)).toISOString();

  if (Date.parse(endAt) < Date.now()) {
    console.log(`[globalgamejam] la edición ${startAt}→${endAt} ya pasó; sin próxima anunciada.`);
    return [];
  }

  return [
    {
      source: "globalgamejam",
      sourceId: `ggj-${year}`,
      url: HOME,
      title: `Global Game Jam ${year}`,
      hosts: [{ name: "Global Game Jam", url: HOME }],
      startAt,
      endAt,
      durationDays: Math.round((Date.parse(endAt) - Date.parse(startAt)) / 86_400_000),
      theme: null,
      tags: ["Mundial", "Sedes", "Presencial"],
      // Evento global con sedes en todo el mundo; se juega en muchos idiomas.
      languages: ["en", "es"],
      hasPrize: false,
      prizeSummary: null,
      prizeValueUsd: null,
      aiPolicy: "unknown",
      mode: "hybrid",
      participants: null,
      country: null,
      ranked: false,
      featured: true,
      enrichmentConfidence: 0.7,
    },
  ];
}
