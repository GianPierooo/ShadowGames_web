/**
 * Dry-run de alertas: muestra qué jams caerían en qué categoría y a qué canal
 * (webhook) irían, SIN enviar nada a Discord. Útil para verificar el enrutado y
 * el anti-duplicado antes de tocar nada en producción.
 * Ejecutar:  npm run alert:dryrun
 * Requiere DATABASE_URL en .env.local. NUNCA imprime URLs de webhook (solo SET/—).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import {
  getSql,
  queryJams,
  selectAlertCandidates,
  selectClosingSoonReminders,
} from "../src/lib/jams/db";
import { ALERT_MAX_PER_RUN, planChannels } from "../src/lib/jams/notify/discord";
import {
  CATEGORIES,
  CLOSING_SOON_DAYS,
  categorize,
  reasonLabel,
} from "../src/lib/jams/notify/categorize";

const WEBHOOK_ENVS = [
  "DISCORD_WEBHOOK_URL",
  ...CATEGORIES.map((c) => c.webhookEnv),
];

async function main() {
  const nowMs = Date.now();
  const general = process.env.DISCORD_WEBHOOK_URL;

  console.log("=== alert dry-run (NO envía nada a Discord) ===\n");
  console.log("webhooks configurados (solo SET/—, nunca la URL):");
  for (const name of WEBHOOK_ENVS) {
    console.log(`  ${name.padEnd(26)} ${process.env[name] ? "SET" : "—"}`);
  }
  if (!general) {
    console.log(
      "\n(!) DISCORD_WEBHOOK_URL no está configurado → en producción se saltarían las alertas (como hoy).",
    );
  }

  // --- Candidatas de alerta (mismo criterio que el cron) ---
  const candidates = await selectAlertCandidates(ALERT_MAX_PER_RUN);
  console.log(
    `\ncandidatas [notified_at null · abiertas · (premio o 'es')]: ${candidates.length}`,
  );
  for (const j of candidates) {
    const cats = categorize(j, nowMs);
    console.log(
      `  · ${j.title.slice(0, 56).padEnd(56)} [${j.source}]  → ${reasonLabel(cats) || "(sin categoría)"}`,
    );
  }

  // --- Plan de envío: a qué canal iría cada grupo (sin URLs) ---
  if (general && candidates.length > 0) {
    const plan = planChannels(candidates, general, nowMs);
    console.log(`\nplan de envío (agrupado ≤10 embeds por mensaje):`);
    for (const ch of plan) {
      const msgs = Math.ceil(ch.jams.length / 10);
      console.log(
        `  canal "${ch.name}": ${ch.jams.length} jam(s) → ${msgs} mensaje(s)`,
      );
    }
  }

  // --- Anti-duplicado ---
  const sql = getSql();
  const [notifRow] = await sql<{ notified: number }[]>`
    select count(*)::int as notified from radar.jams where notified_at is not null
  `;
  console.log(
    `\nanti-duplicado: ${notifRow?.notified ?? 0} jam(s) ya notificadas (notified_at != null) → NO reaparecen como candidatas.`,
  );

  // --- Demostración de categorización + enrutado sobre jams ACTIVAS (read-only) ---
  // Ignora notified_at a propósito, SOLO para ilustrar en qué categoría cae cada
  // jam y a qué canal iría. No envía nada ni toca la BD.
  const active = await queryJams({ activeOnly: true, limit: 500 });
  console.log(`\n── demostración (read-only) sobre ${active.length} jams activas ──`);
  const histo = new Map<string, number>();
  for (const j of active)
    for (const c of categorize(j, nowMs)) histo.set(c.key, (histo.get(c.key) ?? 0) + 1);
  console.log(
    "histograma de categorías: " +
      CATEGORIES.map((c) => `${c.label}=${histo.get(c.key) ?? 0}`).join("  ·  "),
  );
  const sample = active.filter((j) => categorize(j, nowMs).length > 0).slice(0, 10);
  console.log("muestra (jam → categorías):");
  for (const j of sample) {
    console.log(
      `  · ${j.title.slice(0, 52).padEnd(52)} [${j.source}] → ${reasonLabel(categorize(j, nowMs))}`,
    );
  }

  const routePlan = (label: string, getWebhook: (n: string) => string | undefined) => {
    const plan = planChannels(active, general ?? "https://general", nowMs, getWebhook);
    console.log(`\n  ${label}:`);
    for (const ch of plan)
      console.log(`    canal "${ch.name}": ${ch.jams.length} jam(s)`);
  };
  // Escenario A = como HOY (solo el general): ningún webhook específico → TODO a "general".
  routePlan("escenario A · solo DISCORD_WEBHOOK_URL (como hoy)", () => undefined);
  // Escenario B = si además existieran webhooks de premio y español (simulado, sin enviar).
  // Los envs no configurados devuelven undefined → caen al general.
  routePlan(
    "escenario B · +DISCORD_WEBHOOK_PREMIO +DISCORD_WEBHOOK_ES (simulado)",
    (n: string) =>
      n === "DISCORD_WEBHOOK_PREMIO"
        ? "https://sim/premio"
        : n === "DISCORD_WEBHOOK_ES"
          ? "https://sim/es"
          : undefined,
  );

  // --- Recordatorio "cierra pronto" (carril reminded_at) ---
  try {
    const rem = await selectClosingSoonReminders(CLOSING_SOON_DAYS, ALERT_MAX_PER_RUN);
    console.log(
      `\nrecordatorio "cierra pronto" [premio · ≤${CLOSING_SOON_DAYS}d · reminded_at null]: ${rem.length} candidata(s)  (pass DESACTIVADO por REMIND_CLOSING_SOON=false)`,
    );
    for (const j of rem) {
      console.log(
        `  · ${j.title.slice(0, 56).padEnd(56)} deadline ${j.endAt?.slice(0, 10)}`,
      );
    }
  } catch (e) {
    console.log(
      `\n(recordatorio) reminded_at aún no disponible — corre \`npm run migrate\`: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  await sql.end();
}

main().catch(async (err) => {
  console.error("alert-dryrun falló:", err instanceof Error ? err.message : err);
  try {
    await getSql().end();
  } catch {
    /* noop */
  }
  process.exit(1);
});
