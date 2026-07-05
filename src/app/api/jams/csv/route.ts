import { buildCsv, getExportJams } from "@/lib/jams/export";

// Usa postgres.js → runtime Node, no edge. Dinámico (lee query params).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export CSV de las jams activas, con los mismos filtros por query params que
 * la web (premio, efectivo, idioma, ia, fuente multi, cierra, duracion, q, orden).
 */
export async function GET(request: Request) {
  const sp = Object.fromEntries(new URL(request.url).searchParams.entries());
  const jams = await getExportJams(sp);
  const csv = buildCsv(jams);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="radar-de-jams.csv"',
      "cache-control": "no-store",
    },
  });
}
