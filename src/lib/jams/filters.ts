import type { Jam, JamSource, AiPolicy, JamMode } from "./types";

/**
 * Parseo + aplicación de filtros. Es la ÚNICA fuente de verdad de:
 *  - los nombres de los search params, y
 *  - cómo se traducen a un subconjunto ordenado de jams.
 *
 * Search params (ver también el comentario de la página de jams):
 *   q          texto libre
 *   premio     "1"
 *   idioma     es | en | pt
 *   ia         allowed | banned | unknown
 *   modalidad  online | in-person | hybrid
 *   fuente     itch | devpost | ludumdare | cultura-pe
 *   orden      deadline | premio | participantes | reciente   (default: deadline)
 */
export type JamSort = "deadline" | "premio" | "participantes" | "reciente";

export interface JamFilters {
  q: string;
  premio: boolean;
  idioma: string | null;
  ia: AiPolicy | null;
  modalidad: JamMode | null;
  fuente: JamSource | null;
  orden: JamSort;
}

export const SORT_OPTIONS: JamSort[] = [
  "deadline",
  "premio",
  "participantes",
  "reciente",
];
export const AI_OPTIONS: AiPolicy[] = ["allowed", "banned", "unknown"];
export const MODE_OPTIONS: JamMode[] = ["online", "in-person", "hybrid"];
export const LANGUAGE_OPTIONS = ["es", "en", "pt"] as const;

const SOURCES: JamSource[] = [
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

/** Lee los search params y devuelve un objeto de filtros normalizado y validado. */
export function parseJamFilters(sp: RawSearchParams): JamFilters {
  return {
    q: (one(sp.q) ?? "").trim(),
    premio: one(sp.premio) === "1",
    idioma: coerce(one(sp.idioma), LANGUAGE_OPTIONS),
    ia: coerce(one(sp.ia), AI_OPTIONS),
    modalidad: coerce(one(sp.modalidad), MODE_OPTIONS),
    fuente: coerce(one(sp.fuente), SOURCES),
    orden: coerce(one(sp.orden), SORT_OPTIONS) ?? "deadline",
  };
}

/** Nº de filtros activos (el orden NO cuenta como filtro). */
export function countActiveFilters(f: JamFilters): number {
  return [f.q, f.premio, f.idioma, f.ia, f.modalidad, f.fuente].filter(Boolean)
    .length;
}

/** ¿Hay algún filtro activo? */
export function hasActiveFilters(f: JamFilters): boolean {
  return countActiveFilters(f) > 0;
}

function matches(jam: Jam, f: JamFilters, q: string): boolean {
  if (f.premio && !jam.hasPrize) return false;
  if (f.idioma && !jam.languages.includes(f.idioma)) return false;
  if (f.ia && jam.aiPolicy !== f.ia) return false;
  if (f.modalidad && jam.mode !== f.modalidad) return false;
  if (f.fuente && jam.source !== f.fuente) return false;
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

/** Filtra + ordena. Función pura: no depende de red ni de la hora actual. */
export function applyJamFilters(jams: Jam[], f: JamFilters): Jam[] {
  const q = f.q.toLowerCase();
  const filtered = jams.filter((jam) => matches(jam, f, q));
  return sortJams(filtered, f.orden);
}
