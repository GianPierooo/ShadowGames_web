/**
 * Radar de Jams — directorio filtrable (React Server Component).
 *
 * Datos: se leen de Supabase (queryJams sobre radar.jams) con revalidación cada
 * 30 min (el cron actualiza la base 1×/día). Si la base está vacía o falla, cae
 * a los mocks para que la página nunca quede en blanco (con log claro).
 *
 * Los FILTROS viven en la URL; este server component es la FUENTE DE VERDAD del
 * filtrado (aplica los filtros sobre los datos). <FilterBar> sólo los ESCRIBE.
 *
 * Contrato de search params (fuente de verdad en src/lib/jams/filters.ts):
 *   q         texto libre             premio    "1" → hasPrize
 *   efectivo  "1" → prizeValueUsd>0   idioma    es | en | pt
 *   ia        allowed | banned        fuente    lista CSV (itch,devpost,…) → IN
 *   cierra    semana | mes | todas    duracion  relampago | corta | larga
 *   orden     deadline | premio | participantes | reciente   (default: deadline)
 *
 * Ejemplo: /es/jams?premio=1&efectivo=1&idioma=es&fuente=itch,devpost&cierra=semana
 */
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Jam } from "@/lib/jams/types";
import { MOCK_JAMS } from "@/lib/jams/mock";
import {
  applyJamFilters,
  countActiveFilters,
  parseJamFilters,
} from "@/lib/jams/filters";
import { queryJams } from "@/lib/jams/db";
import { SOURCE_ORDER } from "@/lib/jams/labels";
import { routeAlternates } from "@/lib/site";
import { FilterBar } from "@/components/jams/FilterBar";
import { JamGrid } from "@/components/jams/JamGrid";
import { EmptyState } from "@/components/jams/EmptyState";

// Revalidación cada 30 min: el cron actualiza la base una vez al día.
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("jams");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: routeAlternates("/jams"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/es/jams",
    },
  };
}

/** Lectura cacheada de todas las jams abiertas (revalida cada 1800s). */
const getActiveJams = unstable_cache(
  async (): Promise<Jam[]> => queryJams({ activeOnly: true, limit: 500 }),
  ["jams-active"],
  { revalidate: 1800, tags: ["jams"] },
);

export default async function JamsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations("jams");

  const filters = parseJamFilters(sp);
  const activeCount = countActiveFilters(filters);
  const now = new Date();

  // Fuente de datos: Supabase (cacheado) con fallback a mocks.
  let source: Jam[];
  try {
    source = await getActiveJams();
    if (source.length === 0) throw new Error("base vacía");
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[jams/page] usando datos MOCK (${reason}).`);
    source = MOCK_JAMS;
  }

  // El server component filtra/ordena (fuente de verdad del filtrado).
  const total = source.length;
  const jams = applyJamFilters(source, filters, now);

  // Fuentes presentes en el conjunto activo (para no ofrecer chips vacíos).
  const present = new Set(source.map((j) => j.source));
  const availableSources = SOURCE_ORDER.filter((s) => present.has(s));

  const counterSub =
    activeCount > 0
      ? `${t("header.ofJams", { total })} · ${t("header.filtersActive", {
          count: activeCount,
        })}`
      : `${t("header.ofJams", { total })} · ${t("header.noFilters")}`;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[clamp(28px,5vw,40px)] font-bold leading-none tracking-[-0.02em] text-radar-text">
            {t("title")}
          </h1>
          <p className="max-w-[520px] text-[15px] leading-relaxed text-muted">
            {t("subtitle")}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-[26px] font-bold text-radar-text">
            {jams.length}
          </div>
          <div className="text-[13px] text-muted">{counterSub}</div>
        </div>
      </header>

      <FilterBar availableSources={availableSources} />

      <div className="pt-6">
        {jams.length === 0 ? (
          <EmptyState />
        ) : (
          <JamGrid jams={jams} now={now} />
        )}
      </div>
    </div>
  );
}
