/**
 * Prueba del ida y vuelta: lee jams DESDE la base (no desde el motor).
 * Ejecutar:  npm run query:jams
 * Requiere DATABASE_URL en .env.local (y haber corrido la ingesta antes).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { queryJams, getSql } from "../src/lib/jams/db";
import type { Jam, JamSource } from "../src/lib/jams/types";

function fmt(j: Jam): string {
  const dates = `${j.startAt?.slice(0, 10) ?? "—"} → ${j.endAt?.slice(0, 10) ?? "—"}`;
  const prize = j.hasPrize
    ? (j.prizeSummary ?? "sí") + (j.prizeValueUsd != null ? ` [$${j.prizeValueUsd}]` : "")
    : "—";
  return [
    `  [${j.source}] ${j.title}`,
    `    ${dates} · premio: ${prize} · IA: ${j.aiPolicy} · idioma: ${j.languages.join("/") || "—"} · part: ${j.participants ?? "—"}`,
    `    ${j.url}`,
  ].join("\n");
}

async function main() {
  console.log("=== query:jams (leído desde Supabase) ===");
  const sql = getSql();

  // Total + desglose por fuente.
  const countRows = await sql<{ count: number }[]>`select count(*)::int as count from radar.jams`;
  const count = countRows[0]?.count ?? 0;
  const bySource = await sql<{ source: string; n: number }[]>`
    select source, count(*)::int as n from radar.jams group by source order by n desc
  `;
  console.log("total filas en jams:", count);
  console.log("por fuente:", bySource.map((r) => `${r.source}=${r.n}`).join(" · "));
  console.log();

  // Filtro por fuente si se pasó como argumento (ej: npm run query:jams cva-pe).
  const source = process.argv[2] as JamSource | undefined;
  if (source) {
    // queryJams filtra por conjunto de fuentes (IN); pasamos una sola.
    const rows = await queryJams({ sources: [source], activeOnly: true, limit: 6 });
    console.log(`queryJams({ sources: ["${source}"], activeOnly: true }) → ${rows.length} filas:`);
    console.log();
    for (const j of rows) {
      console.log(fmt(j));
      console.log();
    }
  } else {
    const rows = await queryJams({ activeOnly: true, hasPrize: true, limit: 4 });
    console.log(`queryJams({ activeOnly: true, hasPrize: true }) → ${rows.length} filas:`);
    console.log();
    for (const j of rows) {
      console.log(fmt(j));
      console.log();
    }
  }

  await getSql().end();
}

main().catch(async (err) => {
  console.error("query:jams falló:", err instanceof Error ? err.message : err);
  try {
    await getSql().end();
  } catch {
    /* noop */
  }
  process.exit(1);
});
