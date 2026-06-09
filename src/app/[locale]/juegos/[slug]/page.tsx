import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GAMES, getGameBySlug, getGameNeighbors, type Game } from "@/lib/games";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrailerDialog } from "@/components/home/trailer-dialog";
import { GameImage } from "@/components/games/game-image";
import { ScreenshotsGallery } from "@/components/games/screenshots-gallery";
import { routeAlternates, SITE_URL, SITE_LEGAL_NAME } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const game = getGameBySlug(slug);
  if (!game) return {};
  return {
    title: game.title.es,
    description: game.tagline.es,
    alternates: routeAlternates(`/juegos/${slug}`),
    openGraph: {
      type: "article",
      title: game.title.es,
      description: game.tagline.es,
      url: `/es/juegos/${slug}`,
    },
  };
}

const PLATFORM_LABEL: Record<string, string> = {
  pc: "PC",
  mac: "Mac",
  steam: "Steam",
  switch: "Nintendo Switch",
  ps5: "PlayStation 5",
  xbox: "Xbox",
  mobile: "Móvil",
};

const LINK_LABEL: Record<string, string> = {
  steam: "Steam",
  itch: "itch.io",
  site: "Sitio oficial",
};

export default async function GameDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getGameBySlug(slug);
  if (!game) notFound();

  const t = await getTranslations("Games");
  const tStatus = await getTranslations("Status");

  const statusLabel = tStatus(game.status);
  const neighbors = getGameNeighbors(slug)!;
  // accentColor del juego = acento PUNTUAL (glow detrás del título); NO
  // domina el hero ni los placeholders de screenshots (PRINCIPLES: la marca
  // violeta dominante manda). Fallbacks visuales usan el violeta marca.
  const accentTint = game.accentColor ?? "#8b5cf6";

  // CTA externo: solo se renderiza si hay al menos un link real (no "#").
  // PRINCIPLES: cero placeholders disabled (chrome inútil); si no hay URL
  // real todavía, la sección entera se omite.
  const linkOrder: Array<"steam" | "itch" | "site"> = ["steam", "itch", "site"];
  const realLinks = linkOrder.filter(
    (k) => game.links?.[k] && game.links[k] !== "#",
  );
  const primaryLinkKey = realLinks[0];
  const primaryLink = primaryLinkKey ? game.links?.[primaryLinkKey] : undefined;
  const secondaryLinks = realLinks.slice(1);
  const primaryLinkLabel = primaryLinkKey ? `${t("buyOn")} ${LINK_LABEL[primaryLinkKey]}` : null;

  // Descripción larga: split por dobles saltos como párrafos. Si no hay
  // longDescription, usar description.es.
  const body = (game.longDescription?.es ?? game.description.es).trim();
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <GameJsonLd game={game} locale={locale} />

      {/* 1. Hero fullbleed */}
      <section
        className="relative flex min-h-[100svh] items-end overflow-hidden"
        aria-labelledby="game-title"
      >
        {/* Fallback de marca: violeta dominante, no accentColor del juego. */}
        <GameImage src={game.keyArt} alt={game.title.es} initial={game.title.es.charAt(0)} />
        {/* Degradado inferior para legibilidad */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/3"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-20 w-full px-6 pb-20 pt-32 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <Badge variant={game.status} className="mb-5">
              {statusLabel}
            </Badge>
            <div className="relative">
              {/* Acento puntual del juego: glow muy sutil detrás del h1.
                  Diferencia los detalles entre sí sin romper la marca. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 blur-3xl opacity-40"
                style={{
                  background: `radial-gradient(40% 60% at 25% 50%, ${accentTint}55 0%, transparent 70%)`,
                }}
              />
              <h1
                id="game-title"
                className="font-display font-bold leading-[0.95] tracking-tight text-white"
                style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
              >
                {game.title.es}
              </h1>
            </div>
            <p className="mt-4 max-w-2xl text-balance text-lg italic text-white/80 md:text-xl">
              {game.tagline.es}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Trailer — solo si el juego tiene metadata real.
          PRINCIPLES: cero placeholders "próximamente" decorativos. */}
      {game.trailer && (
        <section className="section-y px-6" aria-label={t("trailer")}>
          <div className="flex justify-center">
            <TrailerDialog />
          </div>
        </section>
      )}

      {/* 3. Descripción larga — una sola columna max-w-prose */}
      <section
        className="px-6 pb-24 md:pb-32"
        aria-labelledby="description-heading"
      >
        <div className="mx-auto max-w-prose">
          <h2 id="description-heading" className="sr-only">
            {game.title.es} — descripción
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-[var(--text-muted)]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Screenshots gallery */}
      {game.screenshots.length > 0 && (
        <section
          className="px-6 pb-24 md:pb-32"
          aria-labelledby="screenshots-heading"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="screenshots-heading" className="sr-only">
              {game.title.es} — {t("screenshots")}
            </h2>
            {/* Placeholder de fase 1: usa violeta marca (no accentColor del
                juego) para mantener la marca dominante. */}
            <ScreenshotsGallery shots={game.screenshots} gameTitle={game.title.es} />
          </div>
        </section>
      )}

      {/* 5. Info técnica — una fila simple */}
      <section className="px-6 pb-20" aria-labelledby="tech-heading">
        <div className="mx-auto max-w-prose text-center">
          <h2 id="tech-heading" className="sr-only">
            {game.title.es} — información
          </h2>
          <p className="text-sm text-[var(--text-muted)] md:text-base">
            <TechRow game={game} statusLabel={statusLabel} />
          </p>
        </div>
      </section>

      {/* 6. CTAs externos — solo si hay URL real. Sin placeholders disabled. */}
      {primaryLinkKey && primaryLink && (
        <section className="px-6 pb-24 md:pb-32" aria-label="Conseguir el juego">
          <div className="mx-auto flex max-w-prose flex-col items-center gap-5">
            <Button asChild size="lg" variant="solid">
              <a href={primaryLink} target="_blank" rel="noopener noreferrer">
                {primaryLinkLabel}
              </a>
            </Button>
            {secondaryLinks.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
                {secondaryLinks.map((k) => {
                  const href = game.links?.[k];
                  if (!href) return null;
                  return (
                    <li key={k}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer underline-offset-4 hover:text-[var(--text)] hover:underline focus-visible:outline-none focus-visible:underline"
                      >
                        {`${t("buyOn")} ${LINK_LABEL[k]}`}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* 7. Nav prev/next — minimal */}
      <nav
        aria-label="Navegación entre juegos"
        className="border-t border-[var(--border)] px-6 py-12"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <Link
            href={{ pathname: "/juegos/[slug]", params: { slug: neighbors.prev.slug } }}
            className="group inline-flex flex-1 items-center gap-3 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:text-[var(--text)]"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[var(--text-subtle)]">
                {t("prevGame")}
              </span>
              <span className="font-display text-base font-bold text-[var(--text)] md:text-lg">
                {neighbors.prev.title.es}
              </span>
            </span>
          </Link>
          <Link
            href={{ pathname: "/juegos/[slug]", params: { slug: neighbors.next.slug } }}
            className="group inline-flex flex-1 items-center justify-end gap-3 text-right text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:text-[var(--text)]"
          >
            <span className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-widest text-[var(--text-subtle)]">
                {t("nextGame")}
              </span>
              <span className="font-display text-base font-bold text-[var(--text)] md:text-lg">
                {neighbors.next.title.es}
              </span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>
    </>
  );
}

interface TechRowProps {
  game: Game;
  statusLabel: string;
}

function TechRow({ game, statusLabel }: TechRowProps) {
  const platforms = game.platforms.map((p) => PLATFORM_LABEL[p] ?? p).join(", ");
  const parts = [
    String(game.year),
    game.genres[0] ?? "",
    platforms,
    statusLabel,
  ].filter(Boolean);
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-3">
          {i > 0 && <span className="text-[var(--text-subtle)]" aria-hidden>·</span>}
          <span>{part}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Inyecta JSON-LD VideoGame para el SEO estructurado del juego.
 * https://schema.org/VideoGame
 */
function GameJsonLd({ game, locale }: { game: Game; locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title.es,
    description: game.description.es,
    url: `${SITE_URL}/es/juegos/${game.slug}`,
    image: `${SITE_URL}/es/juegos/${game.slug}/opengraph-image`,
    inLanguage: locale,
    genre: game.genres,
    gamePlatform: game.platforms.map((p) => PLATFORM_LABEL[p] ?? p),
    applicationCategory: "Game",
    publisher: {
      "@type": "Organization",
      name: SITE_LEGAL_NAME,
    },
    datePublished: String(game.year),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
