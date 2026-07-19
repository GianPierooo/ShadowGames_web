import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { CONTRIBUTIONS, type Contribution } from "@/lib/contributions";
import { Button } from "@/components/ui/button";
import { ScreenshotsGallery } from "@/components/games/screenshots-gallery";
import { YouTubeTeaser } from "@/components/contribuciones/youtube-teaser";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  return {
    title: "Contribuciones",
    description:
      "Nuestras aportaciones a Threadbare, de Endless Access: las quests Sueños Nocturnos y El último pétalo.",
    alternates: routeAlternates("/contribuciones"),
    openGraph: { url: "/es/contribuciones" },
  };
}

export default async function ContribucionesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contributions");

  return (
    <>
      {/* Intro */}
      <section className="section-top px-6 pb-16 md:pb-20" aria-labelledby="contrib-title">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl" id="contrib-title">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-[var(--text-muted)]">
            No solo hacemos nuestros juegos. También ponemos manos en proyectos que
            admiramos. Estas son nuestras aportaciones a{" "}
            <a
              href="https://play.threadbare.game"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-medium text-[var(--text)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
            >
              Threadbare
            </a>
            , el juego de Endless Access.
          </p>
        </div>
      </section>

      {CONTRIBUTIONS.map((c) => (
        <ContributionBlock key={c.slug} c={c} t={t} />
      ))}
    </>
  );
}

type Translate = Awaited<ReturnType<typeof getTranslations>>;

function ContributionBlock({ c, t }: { c: Contribution; t: Translate }) {
  const paragraphs = c.body.map((p) => p.es);

  return (
    <section
      className="border-t border-[var(--border)] px-6 py-20 md:py-28"
      aria-labelledby={`contrib-${c.slug}`}
    >
      <div className="mx-auto max-w-5xl">
        {/* Cabecera */}
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--text-subtle)]">
          {c.kind.es} · {c.date.es}
        </p>
        <h2
          id={`contrib-${c.slug}`}
          className="t-h2 font-display font-bold text-[var(--text)]"
        >
          {c.title.es}
        </h2>
        <p className="mt-3 max-w-2xl text-lg italic text-[var(--text-muted)]">{c.lead.es}</p>

        {c.coverPortrait ? (
          // Póster vertical (izquierda) + texto (derecha) en desktop.
          <div className="mt-10 grid items-start gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12">
            <div className="relative mx-auto aspect-[600/852] w-full max-w-[300px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <Image src={c.cover} alt={c.title.es} fill sizes="300px" className="object-cover" />
            </div>
            <div>
              <div className="space-y-5 text-lg leading-relaxed text-[var(--text-muted)]">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {c.highlight && <Highlight text={c.highlight.es} />}
              <div className="mt-8">
                <PlayButton c={c} />
              </div>
            </div>
          </div>
        ) : (
          // Banner apaisado + texto debajo.
          <>
            <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)]">
              <Image
                src={c.cover}
                alt={c.title.es}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-8 max-w-prose space-y-5 text-lg leading-relaxed text-[var(--text-muted)]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {c.highlight && <Highlight text={c.highlight.es} />}
            <div className="mt-8 flex flex-wrap gap-4">
              <PlayButton c={c} />
            </div>
          </>
        )}

        {/* Teaser diferido */}
        {c.teaser && (
          <div className="mt-14">
            <h3 className="mb-5 font-display text-xl font-bold text-[var(--text)]">
              {t("teaserHeading")}
            </h3>
            <YouTubeTeaser youTubeId={c.teaser.youTubeId} poster={c.cover} title={c.title.es} />
          </div>
        )}

        {/* Galería */}
        {c.gallery.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-5 font-display text-xl font-bold text-[var(--text)]">
              {t("galleryHeading")}
            </h3>
            <ScreenshotsGallery shots={c.gallery} gameTitle={c.title.es} />
          </div>
        )}

        {/* Meetup presencial */}
        {c.meetup && <MeetupBlock meetup={c.meetup} t={t} title={c.title.es} />}
      </div>
    </section>
  );
}

function PlayButton({ c }: { c: Contribution }) {
  return (
    <Button asChild size="lg" variant="solid">
      <a href={c.play.url} target="_blank" rel="noopener noreferrer">
        {c.play.label.es}
        <ExternalLink className="size-5" />
      </a>
    </Button>
  );
}

/**
 * Nota destacada (p. ej. lore oficial). Sobria: barra de acento + texto pleno,
 * sin icono decorativo ni caja tintada (PRINCIPLES: cero chrome, cero iconos
 * decorativos). Mismo lenguaje que el pull-quote del manifiesto — la barra la
 * distingue de la prosa muted que la rodea sin gritar.
 */
function Highlight({ text }: { text: string }) {
  return (
    <p className="mt-8 border-l-2 border-[var(--accent)]/50 pl-5 leading-relaxed text-[var(--text)]">
      {text}
    </p>
  );
}

function MeetupBlock({
  meetup,
  t,
  title,
}: {
  meetup: NonNullable<Contribution["meetup"]>;
  t: Translate;
  title: string;
}) {
  const [lead, ...rest] = meetup.photos;

  return (
    <div className="mt-16 border-t border-[var(--border)] pt-12">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[var(--text-subtle)]">
        {meetup.place.es} · {meetup.date.es}
      </p>
      <h3 className="font-display text-2xl font-bold text-[var(--text)] md:text-3xl">
        {t("meetupHeading")}
      </h3>
      <p className="mt-3 max-w-prose text-lg leading-relaxed text-[var(--text-muted)]">
        {meetup.body.es}
      </p>

      {lead && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-card)]">
          <Image
            src={lead}
            alt={`${title} — ${t("meetupHeading")}`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-4">
          <ScreenshotsGallery shots={rest} gameTitle={`${title} — ${t("meetupHeading")}`} />
        </div>
      )}
    </div>
  );
}
