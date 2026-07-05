import type { Jam, JamMode } from "../types";
import { fetchJson } from "./_shared";

/**
 * Devpost SÍ expone JSON. Aloja hackathons de todo tipo, así que filtramos a
 * gamedev con un regex sobre título + temas.
 */
const API_URL =
  "https://devpost.com/api/hackathons?status[]=open&status[]=upcoming&challenge_type[]=online&challenge_type[]=in-person&per_page=50";

const GAMEDEV_RE =
  /\bgame\s?(jam|dev|s)?\b|game development|game\s?design|gamejam|godot|unity|unreal|pixel\s?art|roguelike|platformer|metroidvania|indie\s?game|\bjam\b/i;

interface DevpostHackathon {
  id: number;
  title: string;
  url: string;
  open_state?: string;
  displayed_location?: { location?: string };
  submission_period_dates?: string;
  themes?: { id?: number; name: string }[];
  prize_amount?: string;
  prizes_counts?: { cash?: number; other?: number };
  registrations_count?: number;
  featured?: boolean;
  organization_name?: string;
}

interface DevpostResponse {
  hackathons?: DevpostHackathon[];
}

/**
 * Parsea la respuesta JSON de Devpost a Jam[] (función PURA, sin red →
 * testeable con fixtures). Filtra a hackathons de gamedev y mapea.
 */
export function parseDevpostJson(data: DevpostResponse): Jam[] {
  const hackathons = data.hackathons ?? [];
  return hackathons
    .filter((h) => {
      const haystack = [h.title, ...(h.themes?.map((t) => t.name) ?? [])].join(" ");
      return GAMEDEV_RE.test(haystack);
    })
    .map(toJam);
}

export async function fetchDevpostJams(): Promise<Jam[]> {
  const data = await fetchJson<DevpostResponse>(API_URL);
  return parseDevpostJson(data);
}

function toJam(h: DevpostHackathon): Jam {
  const { startAt, endAt, durationDays } = parseDevpostDates(
    h.submission_period_dates,
  );
  const { prizeValueUsd, prizeSummary } = parsePrize(h.prize_amount);
  const hasCash = (h.prizes_counts?.cash ?? 0) > 0;
  const themes = h.themes?.map((t) => t.name) ?? [];

  return {
    source: "devpost",
    sourceId: String(h.id),
    url: h.url,
    title: h.title.trim(),
    hosts: h.organization_name ? [{ name: h.organization_name }] : [],
    startAt,
    endAt,
    durationDays,
    theme: themes[0] ?? null,
    tags: themes,
    languages: [],
    hasPrize: prizeValueUsd != null ? true : hasCash ? true : null,
    prizeSummary: prizeSummary ?? (hasCash ? "Premio en metálico" : null),
    prizeValueUsd,
    aiPolicy: "unknown",
    mode: parseMode(h.displayed_location?.location),
    participants: h.registrations_count ?? null,
    country: null,
    ranked: null,
    featured: !!h.featured,
    enrichmentConfidence: 0.5,
  };
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

interface Piece {
  month: number;
  day: number;
  year?: number;
}

function parsePiece(s: string): Piece | null {
  const m = s.trim().match(/([A-Za-z]{3,})\s+(\d{1,2})(?:,\s*(\d{4}))?/);
  if (!m) return null;
  const month = MONTHS[m[1]!.slice(0, 3).toLowerCase()];
  if (month === undefined) return null;
  return {
    month,
    day: parseInt(m[2]!, 10),
    year: m[3] ? parseInt(m[3], 10) : undefined,
  };
}

/** "May 19 - Aug 17, 2026" → {startAt, endAt, durationDays}. */
export function parseDevpostDates(raw: string | undefined): {
  startAt: string | null;
  endAt: string | null;
  durationDays: number | null;
} {
  if (!raw) return { startAt: null, endAt: null, durationDays: null };
  const parts = raw.split(/\s+-\s+/).map((p) => p.trim());

  if (parts.length === 1) {
    const p = parsePiece(parts[0]!);
    if (!p || p.year === undefined) return { startAt: null, endAt: null, durationDays: null };
    return { startAt: null, endAt: endIso(p, p.year), durationDays: null };
  }

  const a = parsePiece(parts[0]!);
  const b = parsePiece(parts[1]!);
  if (!a || !b) return { startAt: null, endAt: null, durationDays: null };
  const year = b.year ?? a.year;
  if (year === undefined) return { startAt: null, endAt: null, durationDays: null };

  const startAt = startIso(a, a.year ?? year);
  const endAt = endIso(b, year);
  const durationDays =
    startAt && endAt
      ? Math.max(0, Math.round((Date.parse(endAt) - Date.parse(startAt)) / 86_400_000))
      : null;
  return { startAt, endAt, durationDays };
}

function startIso(p: Piece, year: number): string {
  return new Date(Date.UTC(year, p.month, p.day, 0, 0, 0)).toISOString();
}
function endIso(p: Piece, year: number): string {
  return new Date(Date.UTC(year, p.month, p.day, 23, 59, 0)).toISOString();
}

/** '$<span ...>40,000</span>' → {prizeValueUsd: 40000, prizeSummary: '$40,000'}. */
export function parsePrize(raw: string | undefined): {
  prizeValueUsd: number | null;
  prizeSummary: string | null;
} {
  if (!raw) return { prizeValueUsd: null, prizeSummary: null };
  const cleaned = raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const digits = cleaned.replace(/[^0-9.]/g, "");
  const value = digits ? Math.round(parseFloat(digits)) : NaN;
  if (Number.isNaN(value) || value <= 0) {
    return { prizeValueUsd: null, prizeSummary: cleaned || null };
  }
  return { prizeValueUsd: value, prizeSummary: cleaned };
}

function parseMode(location: string | undefined): JamMode {
  if (!location) return "unknown";
  return /online/i.test(location) ? "online" : "in-person";
}
