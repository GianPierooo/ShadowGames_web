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
 * Fusiona dos jams consideradas la MISMA (mismo evento en dos fuentes). La de
 * mayor `enrichmentConfidence` manda como base; sus campos vacíos se rellenan con
 * los de la otra, y se unen tags/idiomas. Así no se pierde info: p. ej. la de
 * itch trae fechas y la de un agregador trae el premio.
 */
function mergeJams(a: Jam, b: Jam): Jam {
  const [primary, secondary] =
    a.enrichmentConfidence >= b.enrichmentConfidence ? [a, b] : [b, a];
  const pick = <T>(p: T | null, s: T | null): T | null => (p != null ? p : s);
  const uniq = (xs: string[]): string[] => [...new Set(xs)];
  return {
    ...primary,
    startAt: pick(primary.startAt, secondary.startAt),
    endAt: pick(primary.endAt, secondary.endAt),
    durationDays: pick(primary.durationDays, secondary.durationDays),
    theme: pick(primary.theme, secondary.theme),
    hasPrize: primary.hasPrize != null ? primary.hasPrize : secondary.hasPrize,
    prizeSummary: pick(primary.prizeSummary, secondary.prizeSummary),
    prizeValueUsd: pick(primary.prizeValueUsd, secondary.prizeValueUsd),
    participants: pick(primary.participants, secondary.participants),
    country: pick(primary.country, secondary.country),
    ranked: primary.ranked != null ? primary.ranked : secondary.ranked,
    aiPolicy: primary.aiPolicy !== "unknown" ? primary.aiPolicy : secondary.aiPolicy,
    tags: uniq([...primary.tags, ...secondary.tags]),
    languages: uniq([...primary.languages, ...secondary.languages]),
    hosts: primary.hosts.length ? primary.hosts : secondary.hosts,
    enrichmentConfidence: Math.max(
      primary.enrichmentConfidence,
      secondary.enrichmentConfidence,
    ),
  };
}

/**
 * Elimina/unifica duplicados en dos niveles:
 *  1. por (source, sourceId) exacto;
 *  2. cruzado ENTRE fuentes por título normalizado + fechas cercanas.
 * En ambos niveles los duplicados se FUSIONAN (mergeJams): base = mayor confianza,
 * rellenando huecos con la otra fuente.
 */
export function dedupe(jams: Jam[]): Jam[] {
  // Nivel 1: clave (source, sourceId).
  const byId = new Map<string, Jam>();
  for (const jam of jams) {
    const key = `${jam.source}::${jam.sourceId}`;
    const existing = byId.get(key);
    byId.set(key, existing ? mergeJams(existing, jam) : jam);
  }

  // Nivel 2: título normalizado + fechas cercanas (dedup cruzado entre fuentes).
  const kept: Jam[] = [];
  for (const jam of byId.values()) {
    const nt = normTitle(jam.title);
    const dupIndex = kept.findIndex(
      (k) => normTitle(k.title) === nt && datesClose(k, jam),
    );
    if (dupIndex === -1) {
      kept.push(jam);
    } else {
      kept[dupIndex] = mergeJams(kept[dupIndex]!, jam);
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
