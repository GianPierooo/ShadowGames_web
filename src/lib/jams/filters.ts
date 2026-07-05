import type { Jam, JamSource } from "./types";

/**
 * Parseo + aplicación de filtros. ÚNICA fuente de verdad de:
 *  - los nombres de los search params, y
 *  - cómo se traducen a un subconjunto ordenado de jams.
 *
 * Search params (todos reflejados en la URL; la barra los ESCRIBE, el server filtra):
 *   q          texto libre
 *   premio     "1"                        → hasPrize
 *   efectivo   "1"                        → prizeValueUsd > 0 (premio en efectivo)
 *   idioma     es | en | pt
 *   ia         allowed | banned           (toggle avanzado; "unknown" NO filtra)
 *   fuente     lista CSV, p.ej. itch,devpost,cultura-pe   → pertenencia (IN)
 *   cierra     semana | mes | todas       (ventana de deadline; default: todas)
 *   duracion   relampago | corta | larga  (≤48 h / 2–7 días / >7 días)
 *   orden      deadline | premio | participantes | reciente   (default: deadline)
 *
 * TODO (fase futura — datos aún incompletos; no se exponen para no salir vacíos):
 *   solo/equipo (tamaño de equipo), ranked (jam.ranked), motor/tema (engine/theme).
 */
export type JamSort = "deadline" | "premio" | "participantes" | "reciente";
export type DeadlineWindow = "semana" | "mes" | "todas";
export type DurationBucket = "relampago" | "corta" | "larga";
/** IA como filtro: sólo permite/prohíbe (sin "unknown", que no discrimina). */
export type AiFilter = "allowed" | "banned";

export interface JamFilters {
  q: string;
  premio: boolean;
  efectivo: boolean;
  idioma: string | null;
  ia: AiFilter | null;
  fuentes: JamSource[];
  cierra: DeadlineWindow;
  duracion: DurationBucket | null;
  orden: JamSort;
}

export const SORT_OPTIONS: JamSort[] = [
  "deadline",
  "premio",
  "participantes",
  "reciente",
];
export const AI_FILTER_OPTIONS: AiFilter[] = ["allowed", "banned"];
export const DEADLINE_OPTIONS: DeadlineWindow[] = ["semana", "mes", "todas"];
export const DURATION_OPTIONS: DurationBucket[] = ["relampago", "corta", "larga"];
/** Idiomas que se pueden filtrar. La barra destaca es/en; pt sigue siendo válido por URL. */
export const LANGUAGE_OPTIONS = ["es", "en", "pt"] as const;
/** Idiomas ofrecidos en la barra (destacados). */
export const LANGUAGE_BAR_OPTIONS = ["es", "en"] as const;

export const SOURCES: JamSource[] = [
  "itch",
  "devpost",
  "ludumdare",
  "alakajam",
  "globalgamejam",
  "cultura-pe",
  "cva-pe",
];

/** searchParams tal como los entrega Next (valores string | string[] | undefined). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function coerce<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | null {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/** Parsea la lista CSV de fuentes (?fuente=itch,cultura-pe): valida y deduplica. */
export function parseSources(value: string | undefined): JamSource[] {
  if (!value) return [];
  const seen = new Set<JamSource>();
  for (const raw of value.split(",")) {
    const s = raw.trim();
    if ((SOURCES as string[]).includes(s)) seen.add(s as JamSource);
  }
  return [...seen];
}

/** Lee los search params y devuelve un objeto de filtros normalizado y validado. */
export function parseJamFilters(sp: RawSearchParams): JamFilters {
  return {
    q: (one(sp.q) ?? "").trim(),
    premio: one(sp.premio) === "1",
    efectivo: one(sp.efectivo) === "1",
    idioma: coerce(one(sp.idioma), LANGUAGE_OPTIONS),
    ia: coerce(one(sp.ia), AI_FILTER_OPTIONS),
    fuentes: parseSources(one(sp.fuente)),
    cierra: coerce(one(sp.cierra), DEADLINE_OPTIONS) ?? "todas",
    duracion: coerce(one(sp.duracion), DURATION_OPTIONS),
    orden: coerce(one(sp.orden), SORT_OPTIONS) ?? "deadline",
  };
}

/** Nº de filtros activos (el orden NO cuenta; "cierra=todas" tampoco). */
export function countActiveFilters(f: JamFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.premio) n++;
  if (f.efectivo) n++;
  if (f.idioma) n++;
  if (f.ia) n++;
  n += f.fuentes.length;
  if (f.cierra !== "todas") n++;
  if (f.duracion) n++;
  return n;
}

/** ¿Hay algún filtro activo? */
export function hasActiveFilters(f: JamFilters): boolean {
  return countActiveFilters(f) > 0;
}

const DAY_MS = 86_400_000;

/** Duración en días: usa durationDays; si falta, la deriva de start/end; si no, null. */
function durationDays(jam: Jam): number | null {
  if (jam.durationDays != null) return jam.durationDays;
  if (jam.startAt && jam.endAt) {
    const s = Date.parse(jam.startAt);
    const e = Date.parse(jam.endAt);
    if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) return (e - s) / DAY_MS;
  }
  return null;
}

function matchesDuration(jam: Jam, bucket: DurationBucket): boolean {
  const d = durationDays(jam);
  if (d == null) return false; // sin dato de duración → fuera cuando el filtro está activo
  if (bucket === "relampago") return d <= 2; // ≤ 48 h
  if (bucket === "corta") return d > 2 && d <= 7; // 2–7 días
  return d > 7; // larga
}

function matchesDeadline(jam: Jam, win: DeadlineWindow, nowMs: number): boolean {
  if (win === "todas") return true;
  if (!jam.endAt) return false; // sin deadline no "cierra" en ninguna ventana
  const e = Date.parse(jam.endAt);
  if (Number.isNaN(e) || e < nowMs) return false;
  const limit = nowMs + (win === "semana" ? 7 : 30) * DAY_MS;
  return e <= limit;
}

function matches(jam: Jam, f: JamFilters, q: string, nowMs: number): boolean {
  if (f.premio && !jam.hasPrize) return false;
  if (f.efectivo && !(jam.prizeValueUsd != null && jam.prizeValueUsd > 0)) return false;
  if (f.idioma && !jam.languages.includes(f.idioma)) return false;
  if (f.ia && jam.aiPolicy !== f.ia) return false;
  if (f.fuentes.length && !f.fuentes.includes(jam.source)) return false;
  if (!matchesDeadline(jam, f.cierra, nowMs)) return false;
  if (f.duracion && !matchesDuration(jam, f.duracion)) return false;
  if (q) {
    const haystack = [
      jam.title,
      jam.theme ?? "",
      ...jam.tags,
      ...jam.hosts.map((h) => h.name),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function ts(iso: string | null): number {
  return iso ? Date.parse(iso) : 0;
}

/** endAt para orden por deadline: null (sin deadline) va al final. */
function deadlineTs(iso: string | null): number {
  return iso ? Date.parse(iso) : Number.POSITIVE_INFINITY;
}

function sortJams(jams: Jam[], orden: JamSort): Jam[] {
  const arr = [...jams];
  switch (orden) {
    case "premio":
      arr.sort((a, b) => (b.prizeValueUsd ?? -1) - (a.prizeValueUsd ?? -1));
      break;
    case "participantes":
      arr.sort((a, b) => (b.participants ?? -1) - (a.participants ?? -1));
      break;
    case "reciente":
      arr.sort((a, b) => ts(b.startAt) - ts(a.startAt));
      break;
    case "deadline":
    default:
      arr.sort((a, b) => deadlineTs(a.endAt) - deadlineTs(b.endAt));
      break;
  }
  return arr;
}

/**
 * Filtra + ordena. `now` es inyectable (default: ahora) para que las ventanas de
 * deadline/duración se calculen de forma consistente en servidor.
 */
export function applyJamFilters(
  jams: Jam[],
  f: JamFilters,
  now: Date = new Date(),
): Jam[] {
  const q = f.q.toLowerCase();
  const nowMs = now.getTime();
  const filtered = jams.filter((jam) => matches(jam, f, q, nowMs));
  return sortJams(filtered, f.orden);
}
