import type { Jam } from "../types";

/**
 * Categorización de alertas (PURA, sin red ni process.env → testeable con
 * fixtures). Dada una jam, decide en qué categorías cae y con qué color/motivo
 * mostrarla. El enrutado a webhooks (que sí lee env) vive en discord.ts y usa
 * `resolveChannel` de aquí pasándole un predicado — así esto queda testeable.
 *
 * TODA la configuración de categorías vive arriba, en `CATEGORIES`.
 */

// --- Constantes de configuración ---
/** Ventana (días) para "cierra pronto": deadline dentro de N días. */
export const CLOSING_SOON_DAYS = 3;
/** Umbral "relámpago": duración total ≤ N horas. */
export const FLASH_MAX_HOURS = 48;

const DAY_MS = 86_400_000;

// Colores de embed (enteros Discord).
const COLOR_BRASA = 0xe7a95c; // premio
const COLOR_VIOLETA = 0xa78bfa; // convocatoria / español
const COLOR_AMBAR = 0xf5c451; // relámpago
const COLOR_CORAL = 0xef6461; // cierra pronto (urgencia)
const COLOR_NEUTRO = 0x8d889b;

export type CategoryKey = "premio" | "es" | "relampago" | "cierra";

export interface AlertCategory {
  key: CategoryKey;
  /** Etiqueta legible con emoji para el embed ("Motivo de la alerta"). */
  label: string;
  /** Prioridad (menor = más prioritario) para color y enrutado de webhook. */
  priority: number;
  /** Nombre de la env var del webhook específico (opcional; NO es un secreto). */
  webhookEnv: string;
  /** ¿Dispara esta categoría? `nowMs` para las ventanas temporales. */
  test: (jam: Jam, nowMs: number) => boolean;
}

/** Duración total de la jam en horas (durationDays, o derivada de start/end), o null. */
function durationHours(jam: Jam): number | null {
  if (jam.durationDays != null) return jam.durationDays * 24;
  if (jam.startAt && jam.endAt) {
    const s = Date.parse(jam.startAt);
    const e = Date.parse(jam.endAt);
    if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) return (e - s) / 3_600_000;
  }
  return null;
}

/**
 * Catálogo de categorías (orden = prioridad). Cada jam puede caer en varias.
 * Para añadir una categoría o un canal, edita SÓLO esta lista.
 */
export const CATEGORIES: AlertCategory[] = [
  {
    key: "premio",
    label: "💰 Premio en efectivo",
    priority: 1,
    webhookEnv: "DISCORD_WEBHOOK_PREMIO",
    test: (j) => (j.prizeValueUsd ?? 0) > 0,
  },
  {
    key: "es",
    label: "🇪🇸 Español",
    priority: 2,
    webhookEnv: "DISCORD_WEBHOOK_ES",
    test: (j) => j.languages.includes("es"),
  },
  {
    key: "relampago",
    label: "⚡ Relámpago",
    priority: 3,
    webhookEnv: "DISCORD_WEBHOOK_RELAMPAGO",
    test: (j) => {
      const h = durationHours(j);
      return h != null && h <= FLASH_MAX_HOURS;
    },
  },
  {
    key: "cierra",
    label: "⏰ Cierra pronto",
    priority: 4,
    webhookEnv: "DISCORD_WEBHOOK_CIERRA",
    test: (j, nowMs) => {
      if (!j.endAt) return false;
      const e = Date.parse(j.endAt);
      return !Number.isNaN(e) && e >= nowMs && e <= nowMs + CLOSING_SOON_DAYS * DAY_MS;
    },
  },
];

/** Categorías que dispara la jam, en orden de prioridad. */
export function categorize(jam: Jam, nowMs: number): AlertCategory[] {
  return CATEGORIES.filter((c) => c.test(jam, nowMs));
}

/**
 * Color del embed según prioridad: brasa si premio; violeta si convocatoria o
 * español; coral si cierra pronto; ámbar si relámpago; neutro si nada.
 */
export function colorForJam(jam: Jam, cats: AlertCategory[]): number {
  const keys = new Set(cats.map((c) => c.key));
  if (keys.has("premio")) return COLOR_BRASA;
  if (jam.source === "cultura-pe" || jam.source === "cva-pe" || keys.has("es"))
    return COLOR_VIOLETA;
  if (keys.has("cierra")) return COLOR_CORAL;
  if (keys.has("relampago")) return COLOR_AMBAR;
  return COLOR_NEUTRO;
}

/** Motivo legible para el embed: "💰 Premio en efectivo · 🇪🇸 Español". */
export function reasonLabel(cats: AlertCategory[]): string {
  return cats.map((c) => c.label).join(" · ");
}

/**
 * Decide a qué CANAL va una jam: la categoría de mayor prioridad (de las que
 * dispara) cuyo webhook específico esté configurado; si ninguna lo tiene, "general".
 * `hasWebhook` es un predicado inyectado (discord.ts lo liga a process.env) para
 * que esto sea puro y testeable.
 */
export function resolveChannel(
  cats: AlertCategory[],
  hasWebhook: (envName: string) => boolean,
): { key: CategoryKey | "general"; webhookEnv: string | null } {
  for (const c of cats) {
    if (hasWebhook(c.webhookEnv)) return { key: c.key, webhookEnv: c.webhookEnv };
  }
  return { key: "general", webhookEnv: null };
}
