import { buildIcs, getExportJams } from "@/lib/jams/export";

// Usa postgres.js → runtime Node, no edge. Dinámico (lee query params).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export iCal (.ics) de las jams activas, con los mismos filtros por query
 * params que la web (premio, idioma, ia, modalidad, fuente, q, orden).
 */
export async function GET(request: Request) {
  const sp = Object.fromEntries(new URL(request.url).searchParams.entries());
  const jams = await getExportJams(sp);
  const ics = buildIcs(jams);

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="radar-de-jams.ics"',
      "cache-control": "no-store",
    },
  });
}
