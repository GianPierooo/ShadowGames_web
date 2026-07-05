import type { Jam } from "./types";

const DAY_MS = 86_400_000;
const CLOSE_DATES_MS = 4 * DAY_MS; // “fechas cercanas” para dedup cruzado
const ABSURD_FUTURE_MS = 13 * 30 * DAY_MS; // inicio a >~13 meses = probable error
const CLOSED_GRACE_MS = 1 * DAY_MS; // margen tras el deadline

function ms(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

/** Normaliza un título para comparar: minúsculas, sin acentos ni puntuación. */
function normTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function datesClose(a: Jam, b: Jam): boolean {
  const within = (x: number | null, y: number | null) =>
    x != null && y != null && Math.abs(x - y) <= CLOSE_DATES_MS;

  const ea = ms(a.endAt);
  const eb = ms(b.endAt);
  if (ea != null && eb != null) return within(ea, eb);

  const sa = ms(a.startAt);
  const sb = ms(b.startAt);
  if (sa != null && sb != null) return within(sa, sb);

  // Un lado con fechas y el otro sin ellas → conservador: no es duplicado.
  if (ea != null || eb != null || sa != null || sb != null) return false;

  // Ambos sin fechas y mismo título → duplicado.
  return true;
}

/**
 * Elimina duplicados en dos niveles:
 *  1. por (source, sourceId) exacto;
 *  2. cruzado entre fuentes por título normalizado + fechas cercanas.
 * En un empate gana la jam con mayor `enrichmentConfidence`.
 */
export function dedupe(jams: Jam[]): Jam[] {
  // Nivel 1: clave (source, sourceId).
  const byId = new Map<string, Jam>();
  for (const jam of jams) {
    const key = `${jam.source}::${jam.sourceId}`;
    const existing = byId.get(key);
    if (!existing || jam.enrichmentConfidence > existing.enrichmentConfidence) {
      byId.set(key, jam);
    }
  }

  // Nivel 2: título normalizado + fechas cercanas.
  const kept: Jam[] = [];
  for (const jam of byId.values()) {
    const nt = normTitle(jam.title);
    const dupIndex = kept.findIndex(
      (k) => normTitle(k.title) === nt && datesClose(k, jam),
    );
    if (dupIndex === -1) {
      kept.push(jam);
    } else if (jam.enrichmentConfidence > kept[dupIndex]!.enrichmentConfidence) {
      kept[dupIndex] = jam;
    }
  }
  return kept;
}

/**
 * Descarta ruido:
 *  - títulos de "newsletter",
 *  - fechas de inicio absurdas (>~13 meses en el futuro),
 *  - jams ya cerradas (>1 día pasado el deadline).
 */
export function sanitize(jams: Jam[], now: Date = new Date()): Jam[] {
  const nowMs = now.getTime();

  return jams.filter((jam) => {
    if (!jam.title.trim()) return false;
    if (/newsletter/i.test(jam.title)) return false;

    const startMs = ms(jam.startAt);
    if (startMs != null && startMs - nowMs > ABSURD_FUTURE_MS) return false;

    const endMs = ms(jam.endAt);
    if (endMs != null && nowMs - endMs > CLOSED_GRACE_MS) return false;

    return true;
  });
}
