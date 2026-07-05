/**
 * Ingesta manual contra Supabase (sin esperar al cron).
 * Ejecutar:  npm run ingest:once
 * Requiere DATABASE_URL en .env.local.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { ingestJams } from "../src/lib/jams/ingest";
import { getSql } from "../src/lib/jams/db";

async function main() {
  console.log("=== ingest-once → Supabase ===");
  const result = await ingestJams();
  console.log();
  console.log("reporte por fuente :", JSON.stringify(result.report));
  console.log("procesadas         :", result.totalProcessed);
  console.log("upserted en BD     :", result.upserted);
  await getSql().end();
}

main().catch(async (err) => {
  console.error("ingest-once falló:", err instanceof Error ? err.message : err);
  try {
    await getSql().end();
  } catch {
    /* noop */
  }
  process.exit(1);
});
