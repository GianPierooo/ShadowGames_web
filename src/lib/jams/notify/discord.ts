import type { Jam } from "../types";
import { SOURCE_META } from "../labels";
import {
  categorize,
  colorForJam,
  reasonLabel,
  resolveChannel,
  type CategoryKey,
} from "./categorize";

/**
 * Alertas a Discord vía webhook (se disparan dentro del cron de ingesta).
 * Lee los webhooks de process.env; las URLs NUNCA van al repo.
 *
 * Enrutado (mejora Fase 8): cada jam se etiqueta con categorías (categorize.ts)
 * y se manda al webhook específico de su categoría de mayor prioridad SI está
 * configurado; si no, al webhook general DISCORD_WEBHOOK_URL. Con SÓLO el general
 * configurado, todas van al general y el comportamiento es el de siempre
 * (agrupadas ≤10, con pausas, anti-429).
 */

// --- Configuración (arriba del archivo) ---
/** Tope de jams a alertar por corrida (evita blasts en el primer run). */
export const ALERT_MAX_PER_RUN = 30;
/** Máximo de embeds por mensaje de Discord (límite del API: 10). */
const EMBEDS_PER_MESSAGE = 10;
/** Pausa entre mensajes (respeta el rate-limit del webhook). */
const PAUSE_MS = 1200;
/** Si true, manda un aviso al Discord cuando la ingesta tuvo errores de fuente. */
export const ALERT_ON_ERROR = true;
/**
 * Recordatorio recurrente de "cierra pronto": reenvía jams con premio que cierran
 * en ≤ CLOSING_SOON_DAYS y que aún no se recordaron (reminded_at). DESACTIVADO por
 * defecto para no spamear; actívalo poniéndolo en true cuando lo quieras.
 */
export const REMIND_CLOSING_SOON = false;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Env var del webhook general (fallback). */
const GENERAL_ENV = "DISCORD_WEBHOOK_URL";

export function isDiscordConfigured(): boolean {
  return Boolean(process.env[GENERAL_ENV]);
}

function fmtDay(iso: string): string {
  return iso.slice(0, 10);
}

function embedFor(jam: Jam, nowMs: number): Record<string, unknown> {
  const cats = categorize(jam, nowMs);
  const dates =
    jam.startAt && jam.endAt
      ? `${fmtDay(jam.startAt)} → ${fmtDay(jam.endAt)}`
      : jam.endAt
        ? `Deadline ${fmtDay(jam.endAt)}`
        : "Fechas por confirmar";

  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: "Fuente", value: SOURCE_META[jam.source].label, inline: true },
    { name: "Fechas", value: dates, inline: true },
  ];
  if (jam.hasPrize) {
    fields.push({ name: "Premio", value: jam.prizeSummary ?? "Con premio", inline: true });
  }
  fields.push({
    name: "Idioma",
    value: jam.languages.map((c) => c.toUpperCase()).join(" / ") || "—",
    inline: true,
  });
  // Motivo de la alerta: por qué se notificó (mejora Fase 8).
  const reason = reasonLabel(cats);
  if (reason) {
    fields.push({ name: "Motivo de la alerta", value: reason, inline: false });
  }

  return {
    title: jam.title.slice(0, 256),
    url: jam.url,
    description: jam.theme ? `Tema: ${jam.theme}`.slice(0, 300) : undefined,
    color: colorForJam(jam, cats),
    fields,
  };
}

async function postGroup(
  url: string,
  group: Jam[],
  nowMs: number,
  username: string,
  canRetry = true,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username,
      embeds: group.map((j) => embedFor(j, nowMs)),
    }),
  });

  if (res.status === 429 && canRetry) {
    const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
    const waitMs = Math.min(10_000, (body.retry_after ?? 1) * 1000 + 250);
    await sleep(waitMs);
    return postGroup(url, group, nowMs, username, false);
  }
  if (!res.ok) {
    throw new Error(`Discord respondió ${res.status} ${res.statusText}`);
  }
}

/** Grupo de jams que comparten webhook de destino. */
interface Channel {
  /** Nombre del canal (categoría o "general") — para logs, nunca la URL. */
  name: CategoryKey | "general";
  url: string;
  jams: Jam[];
}

/**
 * Reparte las jams por webhook de destino según categoría (con fallback al
 * general). Devuelve los grupos EN ORDEN de aparición. `hasWebhook` inyectable
 * para test; en producción liga a process.env.
 */
export function planChannels(
  jams: Jam[],
  general: string,
  nowMs: number,
  getWebhook: (envName: string) => string | undefined = (n) => process.env[n],
): Channel[] {
  const hasWebhook = (n: string) => Boolean(getWebhook(n));
  const byUrl = new Map<string, Channel>();
  for (const jam of jams) {
    const cats = categorize(jam, nowMs);
    const ch = resolveChannel(cats, hasWebhook);
    const url = (ch.webhookEnv ? getWebhook(ch.webhookEnv) : undefined) ?? general;
    let entry = byUrl.get(url);
    if (!entry) {
      entry = { name: ch.webhookEnv ? ch.key : "general", url, jams: [] };
      byUrl.set(url, entry);
    }
    entry.jams.push(jam);
  }
  return [...byUrl.values()];
}

async function deliver(jams: Jam[], username: string): Promise<Jam[]> {
  const general = process.env[GENERAL_ENV];
  if (!general || jams.length === 0) return [];

  const nowMs = Date.now();
  const channels = planChannels(jams, general, nowMs);
  const sent: Jam[] = [];

  for (const channel of channels) {
    for (let i = 0; i < channel.jams.length; i += EMBEDS_PER_MESSAGE) {
      const group = channel.jams.slice(i, i + EMBEDS_PER_MESSAGE);
      try {
        await postGroup(channel.url, group, nowMs, username);
        sent.push(...group);
      } catch (err) {
        console.warn(
          `[discord] fallo al enviar un lote a "${channel.name}" (${group.length} jams): ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      if (i + EMBEDS_PER_MESSAGE < channel.jams.length) await sleep(PAUSE_MS);
    }
  }
  return sent;
}

/**
 * Envía las jams nuevas a Discord (categorizadas y enrutadas), agrupadas ≤10 por
 * mensaje con pausas. Devuelve las jams efectivamente enviadas (para notified_at).
 * No lanza: los fallos de un lote se loguean y se siguen los demás.
 */
export async function sendJamAlerts(jams: Jam[]): Promise<Jam[]> {
  return deliver(jams, "Radar de Jams");
}

/**
 * Envía recordatorios de "cierra pronto" (mismo enrutado, username distinto).
 * Lo dispara el cron sólo si REMIND_CLOSING_SOON está activo. Devuelve las
 * enviadas (para marcar reminded_at).
 */
export async function sendClosingSoonReminders(jams: Jam[]): Promise<Jam[]> {
  return deliver(jams, "Radar de Jams · recordatorio");
}

// ---------------------------------------------------------------------------
// Alerta de SALUD (solo cuando alguna fuente falla, no en cada corrida)
// ---------------------------------------------------------------------------

/**
 * Aviso de salud a Discord: un ÚNICO mensaje de resumen, y SOLO si hubo error en
 * alguna fuente. No lanza (los fallos se tragan con log). Devuelve si se envió.
 */
export async function sendHealthAlert(
  report: Record<string, number | string>,
  summary: { upserted: number; alertsSent: number; failedSources: string[] },
): Promise<boolean> {
  const url = process.env[GENERAL_ENV];
  if (!url || summary.failedSources.length === 0) return false;

  const lines = Object.entries(report).map(([source, v]) =>
    typeof v === "number" ? `✅ ${source}: ${v}` : `❌ ${source}: ${v}`,
  );
  const content = [
    `⚠️ **Radar de Jams — ingesta con errores** (${summary.failedSources.length} fuente(s): ${summary.failedSources.join(", ")})`,
    ...lines,
    `upserted=${summary.upserted} · alertas enviadas=${summary.alertsSent}`,
  ]
    .join("\n")
    .slice(0, 1900);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "Radar de Jams · salud", content }),
    });
    if (!res.ok) {
      console.warn(`[discord] aviso de salud respondió ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      `[discord] aviso de salud falló: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}
