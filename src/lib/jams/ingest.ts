import type { Jam } from "./types";
import { runAllAdapters, type AdapterReport } from "./sources";
import { enrichHeuristics } from "./enrich";
import { dedupe, sanitize } from "./normalize";
import {
  getPersistedEnrichment,
  markNotified,
  selectAlertCandidates,
  upsertJams,
} from "./db";
import { fetchItchDetail } from "./sources/itch-detail";
import {
  ALERT_MAX_PER_RUN,
  ALERT_ON_ERROR,
  isDiscordConfigured,
  sendHealthAlert,
  sendJamAlerts,
} from "./notify/discord";

/** Umbral: por encima de esto la jam se considera bien enriquecida. */
const ENRICHED_THRESHOLD = 0.8;
/** Tope de páginas de detalle a bajar por corrida. */
const DETAIL_MAX_PER_RUN = 40;
/** Concurrencia de descargas de detalle. */
const DETAIL_CONCURRENCY = 4;
/** Pausa entre lotes (cortesía con la fuente). */
const DETAIL_PAUSE_MS = 300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface IngestResult {
  report: AdapterReport;
  totalProcessed: number;
  upserted: number;
  /** Métricas del pass 2 (enriquecimiento por detalle, sin IA). */
  detail: {
    candidates: number;
    fetched: number;
    cached: number;
    failed: number;
  };
  /** Métricas de alertas a Discord. */
  alerts: {
    skipped: boolean;
    candidates: number;
    sent: number;
  };
}

/**
 * Alertas a Discord: candidatas nunca notificadas (con premio o en español, y
 * abiertas), agrupadas con pausas. Marca notified_at a las enviadas. Si no hay
 * webhook, se saltea con log SIN tocar notified_at (para alertar cuando se
 * configure). Nunca tumba la ingesta.
 */
async function runAlertPass(): Promise<IngestResult["alerts"]> {
  if (!isDiscordConfigured()) {
    console.log("[ingest] alertas: DISCORD_WEBHOOK_URL no configurado, salto alertas.");
    return { skipped: true, candidates: 0, sent: 0 };
  }
  const candidates = await selectAlertCandidates(ALERT_MAX_PER_RUN);
  if (candidates.length === 0) {
    console.log("[ingest] alertas: sin candidatas nuevas.");
    return { skipped: false, candidates: 0, sent: 0 };
  }
  let sent = 0;
  try {
    const delivered = await sendJamAlerts(candidates);
    if (delivered.length > 0) {
      await markNotified(delivered.map((j) => `${j.source}::${j.sourceId}`));
    }
    sent = delivered.length;
  } catch (err) {
    console.warn(
      `[ingest] alertas: fallo general (no tumba la ingesta): ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  console.log(`[ingest] alertas: ${sent}/${candidates.length} enviadas a Discord.`);
  return { skipped: false, candidates: candidates.length, sent };
}

/**
 * Pass 2 (sin IA): baja la página de detalle de itch y re-corre las heurísticas
 * sobre su texto para resolver premio / IA / idioma.
 *  - CACHEA por (source, source_id): si ya está bien enriquecida (conf ≥ 0.8),
 *    arrastra lo persistido y NO baja el detalle otra vez.
 *  - Sólo itch de baja confianza; concurrencia y tope por corrida; pausas.
 */
async function runDetailPass(jams: Jam[]): Promise<{
  jams: Jam[];
  candidates: number;
  fetched: number;
  cached: number;
  failed: number;
}> {
  const persisted = await getPersistedEnrichment();
  const out = [...jams];
  const candidateIdx: number[] = [];
  let cached = 0;

  for (let i = 0; i < out.length; i++) {
    const jam = out[i];
    if (!jam) continue;
    const prev = persisted.get(`${jam.source}::${jam.sourceId}`);

    // Cache hit: ya bien enriquecida → arrastra y no vuelve a bajar el detalle.
    if (prev && prev.enrichmentConfidence >= ENRICHED_THRESHOLD) {
      out[i] = { ...jam, ...prev };
      cached++;
      continue;
    }

    // Candidatos: itch de baja confianza (su detalle trae premio/IA/idioma).
    if (jam.source === "itch" && jam.enrichmentConfidence < ENRICHED_THRESHOLD) {
      candidateIdx.push(i);
    }
  }

  const targets = candidateIdx.slice(0, DETAIL_MAX_PER_RUN);
  if (candidateIdx.length > targets.length) {
    console.log(
      `[ingest] detalle: ${candidateIdx.length} candidatos, limitado a ${targets.length} por corrida.`,
    );
  }

  let fetched = 0;
  let failed = 0;
  for (let start = 0; start < targets.length; start += DETAIL_CONCURRENCY) {
    const batch = targets.slice(start, start + DETAIL_CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (idx) => {
        const target = out[idx]!;
        const text = await fetchItchDetail(target.url);
        return { idx, jam: enrichHeuristics(target, text) };
      }),
    );
    for (const r of settled) {
      if (r.status === "fulfilled") {
        out[r.value.idx] = r.value.jam;
        fetched++;
      } else {
        failed++;
        const reason = r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.warn(`[ingest] detalle: fallo (se conserva la heurística de listado): ${reason}`);
      }
    }
    if (start + DETAIL_CONCURRENCY < targets.length) await sleep(DETAIL_PAUSE_MS);
  }

  console.log(
    `[ingest] pass 2 (detalle, sin IA): ${fetched} descargados · ${cached} cacheados · ${candidateIdx.length} candidatos · ${failed} fallos.`,
  );
  return { jams: out, candidates: candidateIdx.length, fetched, cached, failed };
}

/**
 * Pipeline de ingesta completo:
 *   runAllAdapters → enrichHeuristics → sanitize → dedupe → [pass 2 detalle] → upsertJams.
 * No toca la UI: sólo persiste en la base. Sin IA en ninguna parte.
 */
export async function ingestJams(): Promise<IngestResult> {
  const { jams: raw, report } = await runAllAdapters();
  const processed = dedupe(sanitize(raw.map((j) => enrichHeuristics(j))));
  const pass2 = await runDetailPass(processed);
  const upserted = await upsertJams(pass2.jams);
  const alerts = await runAlertPass();

  const result: IngestResult = {
    report,
    totalProcessed: pass2.jams.length,
    upserted,
    detail: {
      candidates: pass2.candidates,
      fetched: pass2.fetched,
      cached: pass2.cached,
      failed: pass2.failed,
    },
    alerts,
  };
  console.log(
    `[ingest] fuentes=${JSON.stringify(report)} procesadas=${pass2.jams.length} upserted=${upserted} detalle=${JSON.stringify(result.detail)} alertas=${JSON.stringify(alerts)}`,
  );

  // Aviso de salud: solo si alguna fuente falló (no en cada corrida).
  const failedSources = Object.entries(report)
    .filter(([, v]) => typeof v === "string")
    .map(([source]) => source);
  if (ALERT_ON_ERROR && failedSources.length > 0) {
    await sendHealthAlert(report, {
      upserted,
      alertsSent: alerts.sent,
      failedSources,
    }).catch(() => {});
  }

  return result;
}
