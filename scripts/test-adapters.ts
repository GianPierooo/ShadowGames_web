/**
 * Verificación en vivo del motor de datos (Fase 3).
 * Pipeline: runAllAdapters → enrichHeuristics → sanitize → dedupe → validación zod.
 *
 * Ejecutar:  npx tsx scripts/test-adapters.ts
 * NO toca la UI ni la base de datos: sólo prueba la capa de datos.
 */
import { runAllAdapters } from "../src/lib/jams/sources";
import { enrichHeuristics } from "../src/lib/jams/enrich";
import { dedupe, sanitize } from "../src/lib/jams/normalize";
import { validateJams } from "../src/lib/jams/schema";
import type { Jam } from "../src/lib/jams/types";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 16).replace("T", " ") + "Z";
}

function fmtExample(j: Jam): string {
  const dur = j.durationDays != null ? ` (${j.durationDays}d)` : "";
  const prize = j.hasPrize
    ? (j.prizeSummary ?? "sí") + (j.prizeValueUsd != null ? ` [$${j.prizeValueUsd}]` : "")
    : j.hasPrize === false
      ? "no"
      : "desconocido";
  const parts = [
    `  [${j.source}] ${j.title}`,
    `    fechas:  ${fmtDate(j.startAt)}  →  ${fmtDate(j.endAt)}${dur}`,
    `    premio:  ${prize}`,
    `    IA: ${j.aiPolicy} · idioma: ${j.languages.join("/") || "—"} · participantes: ${j.participants ?? "—"} · modo: ${j.mode}` +
      (j.featured ? " · featured" : "") +
      (j.ranked ? " · ranked" : ""),
    `    conf: ${j.enrichmentConfidence.toFixed(2)} · ${j.url}`,
  ];
  return parts.join("\n");
}

function pickExamples(jams: Jam[], n: number): Jam[] {
  const out: Jam[] = [];
  const seenSource = new Set<string>();
  // Primero uno por fuente (para diversidad).
  for (const j of jams) {
    if (!seenSource.has(j.source)) {
      seenSource.add(j.source);
      out.push(j);
    }
    if (out.length >= n) return out;
  }
  // Luego rellena con lo que haya.
  for (const j of jams) {
    if (!out.includes(j)) out.push(j);
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}

function countBySource(jams: Jam[]): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const j of jams) acc[j.source] = (acc[j.source] ?? 0) + 1;
  return acc;
}

async function main() {
  const now = new Date();
  console.log("=== Radar de Jams · test de adapters (Fase 3) ===");
  console.log("now:", now.toISOString());
  console.log();

  // 1) Fuentes
  const { jams: raw, report } = await runAllAdapters();

  console.log("--- Reporte por fuente (crudo) ---");
  for (const [source, value] of Object.entries(report)) {
    console.log(`  ${source.padEnd(11)} : ${value}`);
  }
  console.log();

  // 2) Enriquecer → 3) sanear → 4) deduplicar
  const enriched = raw.map((j) => enrichHeuristics(j));
  const sane = sanitize(enriched, now);
  const deduped = dedupe(sane);

  // 5) Validar contra el schema zod
  const { valid, invalid } = validateJams(deduped);

  console.log("--- Pipeline ---");
  console.log(`  crudo (runAllAdapters) : ${raw.length}`);
  console.log(`  tras sanitize          : ${sane.length}`);
  console.log(`  tras dedupe            : ${deduped.length}`);
  console.log(`  válidas (zod)          : ${valid.length}  (inválidas: ${invalid.length})`);
  if (invalid.length > 0) {
    for (const bad of invalid.slice(0, 5)) {
      console.log(`    ✗ [${bad.index}] ${bad.title ?? "(sin título)"} → ${bad.error}`);
    }
  }
  console.log();

  console.log("--- Totales (sobre válidas) ---");
  console.log(`  con premio  : ${valid.filter((j) => j.hasPrize === true).length}`);
  console.log(`  en español  : ${valid.filter((j) => j.languages.includes("es")).length}`);
  console.log(`  featured    : ${valid.filter((j) => j.featured).length}`);
  console.log(`  IA definida : ${valid.filter((j) => j.aiPolicy !== "unknown").length}`);
  console.log(`  por fuente  : ${JSON.stringify(countBySource(valid))}`);
  console.log();

  console.log("--- Ejemplos ---");
  for (const j of pickExamples(valid, 4)) {
    console.log(fmtExample(j));
    console.log();
  }

  console.log("=== fin ===");
}

main().catch((err) => {
  console.error("test-adapters falló:", err);
  process.exit(1);
});
