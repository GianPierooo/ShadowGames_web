import { NextResponse } from "next/server";
import { ingestJams } from "@/lib/jams/ingest";

// Usamos postgres.js + cheerio → runtime Node, no edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Endpoint de ingesta para Vercel Cron.
 * Protegido: si existe CRON_SECRET, exige `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron lo envía automáticamente). Sin secret configurado, queda abierto
 * (útil en local).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const startedAt = new Date();
  try {
    const result = await ingestJams();
    // `report` marca por fuente: número (fetched OK) o "error: …" (fallo).
    const failedSources = Object.entries(result.report)
      .filter(([, v]) => typeof v === "string")
      .map(([source]) => source);

    const summary = {
      ok: true,
      timestamp: startedAt.toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      hadError: failedSources.length > 0,
      failedSources,
      sources: result.report,
      totalProcessed: result.totalProcessed,
      upserted: result.upserted,
      detail: result.detail,
      alerts: result.alerts,
    };
    console.log(
      `[cron/jams] ${summary.timestamp} · ${summary.durationMs}ms · upserted=${result.upserted} · alerts=${result.alerts.sent} · ${
        failedSources.length ? `errores: ${failedSources.join(",")}` : "sin errores"
      }`,
    );
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/jams] fallo total: ${message}`);
    return NextResponse.json(
      { ok: false, timestamp: startedAt.toISOString(), error: message },
      { status: 500 },
    );
  }
}
