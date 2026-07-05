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

  try {
    const result = await ingestJams();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
