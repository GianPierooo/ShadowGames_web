import type { Jam } from "./types";
import { MOCK_JAMS } from "./mock";
import {
  applyJamFilters,
  parseJamFilters,
  type RawSearchParams,
} from "./filters";
import { queryJams } from "./db";
import { SOURCE_META } from "./labels";

/**
 * Jams para exportar: activas desde Supabase, filtradas con los MISMOS filtros
 * de la web (parseJamFilters + applyJamFilters). Fallback a mocks si la base
 * está vacía o falla, para que el export nunca quede en blanco.
 */
export async function getExportJams(sp: RawSearchParams): Promise<Jam[]> {
  const filters = parseJamFilters(sp);
  let all: Jam[];
  try {
    all = await queryJams({ activeOnly: true, limit: 500 });
    if (all.length === 0) all = MOCK_JAMS;
  } catch (err) {
    console.warn(
      `[export] Supabase no disponible, uso mocks: ${err instanceof Error ? err.message : String(err)}`,
    );
    all = MOCK_JAMS;
  }
  return applyJamFilters(all, filters);
}

// ---------------------------------------------------------------------------
// iCal (.ics)
// ---------------------------------------------------------------------------

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Plegado de líneas iCal (RFC 5545): ≤75 octetos, continuación con espacio. */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) {
    parts.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  parts.push(" " + rest);
  return parts.join("\r\n");
}

/** ISO → "YYYYMMDDTHHMMSSZ" (UTC). */
function dtUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** ISO → "YYYYMMDD". */
function dateOnly(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "");
}

export function buildIcs(jams: Jam[]): string {
  const stamp = dtUtc(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shadow Games//Radar de Jams//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Radar de Jams",
  ];

  for (const jam of jams) {
    const uid = `${jam.source}-${jam.sourceId}@radar-jams`.replace(/\s+/g, "");
    const ev: string[] = ["BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${stamp}`];

    if (jam.startAt && jam.endAt) {
      ev.push(`DTSTART:${dtUtc(jam.startAt)}`, `DTEND:${dtUtc(jam.endAt)}`);
    } else if (jam.endAt) {
      // Sólo deadline → evento de todo el día en esa fecha.
      const end = new Date(jam.endAt);
      end.setUTCDate(end.getUTCDate() + 1);
      ev.push(
        `DTSTART;VALUE=DATE:${dateOnly(jam.endAt)}`,
        `DTEND;VALUE=DATE:${dateOnly(end.toISOString())}`,
      );
    } else if (jam.startAt) {
      ev.push(`DTSTART:${dtUtc(jam.startAt)}`);
    } else {
      continue; // sin fechas → no es un evento de calendario
    }

    const prize = jam.hasPrize ? (jam.prizeSummary ?? "Con premio") : "Sin premio";
    const desc = `${prize} · Fuente: ${SOURCE_META[jam.source].label} · ${jam.url}`;
    ev.push(
      `SUMMARY:${escapeIcs(jam.title)}`,
      `DESCRIPTION:${escapeIcs(desc)}`,
      `URL:${escapeIcs(jam.url)}`,
      "END:VEVENT",
    );
    lines.push(...ev);
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

const CSV_HEADERS = [
  "titulo",
  "fuente",
  "inicio",
  "fin_deadline",
  "tema",
  "idioma",
  "premio",
  "ia",
  "participantes",
  "url",
];

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildCsv(jams: Jam[]): string {
  const rows: string[] = [CSV_HEADERS.join(",")];
  for (const jam of jams) {
    const cells = [
      jam.title,
      SOURCE_META[jam.source].label,
      jam.startAt?.slice(0, 10) ?? "",
      jam.endAt?.slice(0, 10) ?? "",
      jam.theme ?? "",
      jam.languages.join("/"),
      jam.hasPrize
        ? (jam.prizeSummary ?? "sí")
        : jam.hasPrize === false
          ? "no"
          : "",
      jam.aiPolicy,
      jam.participants != null ? String(jam.participants) : "",
      jam.url,
    ];
    rows.push(cells.map((c) => csvCell(String(c))).join(","));
  }
  return rows.join("\r\n") + "\r\n";
}
