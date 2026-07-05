import type { Jam } from "../types";
import { SOURCE_META } from "../labels";

/**
 * Alertas a Discord vía webhook (se disparan dentro del cron de ingesta).
 * Lee DISCORD_WEBHOOK_URL de process.env; si no está, el llamador se saltea las
 * alertas con log (nunca rompe la ingesta). La URL del webhook NUNCA va al repo.
 */

// --- Configuración (arriba del archivo, como pide la spec) ---
/** Tope de jams a alertar por corrida (evita blasts en el primer run). */
export const ALERT_MAX_PER_RUN = 30;
/** Máximo de embeds por mensaje de Discord (límite del API: 10). */
const EMBEDS_PER_MESSAGE = 10;
/** Pausa entre mensajes (respeta el rate-limit del webhook). */
const PAUSE_MS = 1200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isDiscordConfigured(): boolean {
  return Boolean(process.env.DISCORD_WEBHOOK_URL);
}

/** Color del embed: brasa si hay premio, violeta para convocatorias, neutro si no. */
function colorFor(jam: Jam): number {
  if (jam.hasPrize) return 0xe7a95c; // brasa
  if (jam.source === "cultura-pe" || jam.source === "cva-pe") return 0xa78bfa; // violeta
  return 0x8d889b; // neutro
}

function fmtDay(iso: string): string {
  return iso.slice(0, 10);
}

function embedFor(jam: Jam): Record<string, unknown> {
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

  return {
    title: jam.title.slice(0, 256),
    url: jam.url,
    description: jam.theme ? `Tema: ${jam.theme}`.slice(0, 300) : undefined,
    color: colorFor(jam),
    fields,
  };
}

async function postGroup(url: string, group: Jam[], canRetry = true): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "Radar de Jams",
      embeds: group.map(embedFor),
    }),
  });

  if (res.status === 429 && canRetry) {
    const body = (await res.json().catch(() => ({}))) as { retry_after?: number };
    const waitMs = Math.min(10_000, (body.retry_after ?? 1) * 1000 + 250);
    await sleep(waitMs);
    return postGroup(url, group, false);
  }
  if (!res.ok) {
    throw new Error(`Discord respondió ${res.status} ${res.statusText}`);
  }
}

/**
 * Envía las jams a Discord agrupadas (≤10 por mensaje), con pausas.
 * Devuelve las jams efectivamente enviadas (para marcar notified_at).
 * No lanza: los fallos de un lote se loguean y se siguen los demás.
 */
export async function sendJamAlerts(jams: Jam[]): Promise<Jam[]> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url || jams.length === 0) return [];

  const sent: Jam[] = [];
  for (let i = 0; i < jams.length; i += EMBEDS_PER_MESSAGE) {
    const group = jams.slice(i, i + EMBEDS_PER_MESSAGE);
    try {
      await postGroup(url, group);
      sent.push(...group);
    } catch (err) {
      console.warn(
        `[discord] fallo al enviar un lote (${group.length} jams): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
    if (i + EMBEDS_PER_MESSAGE < jams.length) await sleep(PAUSE_MS);
  }
  return sent;
}
