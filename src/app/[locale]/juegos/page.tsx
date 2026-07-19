import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GAMES, type GameStatus } from "@/lib/games";
import {
  STATUS_ORDER,
  parseStatusParam,
  parseGenreParam,
} from "@/lib/filters";
import { GameCard } from "@/components/home/game-card";
import { FilterBar } from "@/components/games/filter-bar";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ estado?: string; genero?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Games");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: routeAlternates("/juegos"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/es/juegos",
    },
  };
}

/** Sort canónico del catálogo: featured primero, luego año desc, luego título. */
function sortCatalog<T extends { featured: boolean; year: number; title: { es: string } }>(
  list: T[],
): T[] {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.year !== b.year) return b.year - a.year;
    return a.title.es.localeCompare(b.title.es, "es");
  });
}

export default async function GamesIndexPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { estado, genero } = await searchParams;

  const t = await getTranslations("Games");
  const tStatus = await getTranslations("Status");

  // Lista canónica de géneros del catálogo (para validar el filtro y el dropdown).
  const allGenres = Array.from(
    new Set(GAMES.flatMap((g) => g.genres)),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const statusFilter = parseStatusParam(estado);
  const genreFilter = parseGenreParam(genero, allGenres);

  const filtered = sortCatalog(
    GAMES.filter(
      (g) =>
        (statusFilter === null || g.status === statusFilter) &&
        (genreFilter === null || g.genres.includes(genreFilter)),
    ),
  );

  const statusLabels = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, tStatus(s)]),
  ) as Record<GameStatus, string>;

  const resultsLabel = `${t("resultsCount", { count: filtered.length })} ${t(
    "resultsOf",
    { total: GAMES.length },
  )}`;

  return (
    <>
      {/* Page header — entrada CSS (el h1 es LCP, no debe gatearse tras JS) */}
      <section className="section-top px-6 pb-10 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-3">
            <p className="intro text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {t("eyebrow")}
            </p>
            <h1 className="intro-lcp font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="intro intro-d2 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
              {t("subtitle")}
            </p>
          </header>
        </div>
      </section>

      {/* Filter bar sticky */}
      <FilterBar
        genres={allGenres}
        statusLabels={statusLabels}
        resultsLabel={resultsLabel}
        current={{ estado: estado ?? null, genero: genero ?? null }}
      />

      {/* Resultados */}
      <section className="px-6 py-12 md:py-16" aria-labelledby="results-heading">
        <div className="mx-auto max-w-6xl">
          {/* h2 sr-only para que la jerarquía sea h1→h2→h3 (las cards usan h3).
              Sin esto, Lighthouse marca heading-order: skipped. */}
          <h2 id="results-heading" className="sr-only">
            {t("resultsHeading")}
          </h2>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            (() => {
              // Composición editorial: el primero (featured por el sort) va como
              // BANNER apaisado a todo el ancho; el resto, en una rejilla de
              // tiles. El banner NO se envuelve en Reveal: puede ser el LCP de la
              // página, así que se pinta de inmediato (sin gatearlo tras JS).
              // Estamos en la rama `filtered.length > 0`, así que [0] existe.
              const featured = filtered[0]!;
              const rest = filtered.slice(1);
              return (
                <div className="flex flex-col gap-5 md:gap-6">
                  <GameCard
                    game={featured}
                    statusLabel={statusLabels[featured.status]}
                    variant="banner"
                  />
                  {rest.length > 0 && (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {rest.map((game, i) => (
                        <Reveal as="li" key={game.slug} delay={(i % 2) * 0.06}>
                          <GameCard
                            game={game}
                            statusLabel={statusLabels[game.status]}
                          />
                        </Reveal>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </section>
    </>
  );
}

async function EmptyState() {
  const t = await getTranslations("Games");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
      <p className="text-lg text-[var(--text-muted)]">{t("empty")}</p>
      <Button asChild size="md" variant="outline">
        <Link href="/juegos">{t("filtersClear")}</Link>
      </Button>
    </div>
  );
}
