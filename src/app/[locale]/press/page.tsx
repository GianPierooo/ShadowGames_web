import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/lib/games";
import { PressTrailerButton } from "@/components/press/press-trailer-button";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const PRESS_EMAIL = "shadowgames.devteam@gmail.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Press");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: routeAlternates("/press"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/es/press",
    },
  };
}

/**
 * /press — Kit de prensa.
 *
 * Override de MASTER.md documentado en
 * `design-system/shadow-games-studio/pages/press.md`.
 *
 * Una sola columna `max-w-3xl`. Sin tablas, sin cards con border, sin
 * iconos junto a items del fact sheet, sin badges en las descargas.
 *
 * Bio: placeholder hasta que el cliente pase la copia real. Buscar
 * `TODO: bio prensa real` para sustituir.
 *
 * Los ZIPs se regeneran con `npm run press:zip`. Cuando lleguen los
 * assets definitivos (logos, key arts, screenshots) regenerar el ZIP.
 */
export default async function PressPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Press");

  return (
    <div className="mx-auto max-w-3xl px-6 section-top pb-24 md:pb-32">
      {/* 1. Header de página ──────────────────────────────────────── */}
      <header className="mb-24 md:mb-32">
        <p className="mb-5 text-xs uppercase tracking-[0.25em] text-[var(--text-subtle)]">
          {t("eyebrow")}
        </p>
        <h1
          className="font-display font-bold leading-[1.05] tracking-tight text-balance text-[var(--text)]"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-5 max-w-prose text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
          {t("subtitle")}
        </p>
      </header>

      {/* 2. Bio prensa ────────────────────────────────────────────── */}
      {/* TODO: bio prensa real — sustituir Press.bioP1..P3 en es.json
          cuando el cliente pase la copia fáctica definitiva. */}
      <section className="mb-24 md:mb-32" aria-labelledby="bio-heading">
        <h2
          id="bio-heading"
          className="mb-8 font-display text-2xl font-bold text-[var(--text)]"
        >
          {t("bioHeading")}
        </h2>
        <div className="space-y-5 text-base leading-relaxed text-[var(--text-muted)]">
          <p>{t("bioP1")}</p>
          <p>{t("bioP2")}</p>
          <p>{t("bioP3")}</p>
        </div>
      </section>

      {/* 3. Fact sheet ────────────────────────────────────────────── */}
      <section className="mb-24 md:mb-32" aria-labelledby="fact-heading">
        <h2
          id="fact-heading"
          className="mb-8 font-display text-2xl font-bold text-[var(--text)]"
        >
          {t("factSheetHeading")}
        </h2>
        <dl className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          <FactRow label={t("factFounded")} value={t("factFoundedValue")} />
          <FactRow label={t("factLocation")} value={t("factLocationValue")} />
          <FactRow label={t("factFounders")} value={t("factFoundersValue")} />
          <FactRow label={t("factGameCount")} value={String(GAMES.length)} />
          <FactRow
            label={t("factPlatforms")}
            value={t("factPlatformsValue")}
          />
          <FactRow
            label={t("factPressContact")}
            value={
              <a
                href={`mailto:${PRESS_EMAIL}`}
                className="cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                {PRESS_EMAIL}
              </a>
            }
          />
          <FactRow
            label={t("factWeb")}
            value={
              <a
                href="https://shadowgames.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                {t("factWebValue")}
              </a>
            }
          />
        </dl>
      </section>

      {/* 4. Descargas ─────────────────────────────────────────────── */}
      <section className="mb-24 md:mb-32" aria-labelledby="downloads-heading">
        <h2
          id="downloads-heading"
          className="mb-8 font-display text-2xl font-bold text-[var(--text)]"
        >
          {t("downloadsHeading")}
        </h2>
        <ul className="flex flex-col gap-3" role="list">
          <DownloadItem
            href="/press/shadow-games-logos.zip"
            label={t("downloadLogos")}
          />
          <DownloadItem
            href="/press/shadow-games-key-arts.zip"
            label={t("downloadKeyArts")}
          />
          <DownloadItem
            href="/press/shadow-games-screenshots.zip"
            label={t("downloadScreenshots")}
          />
          <DownloadItem
            href="/press/shadow-games-press-kit.zip"
            label={t("downloadAll")}
            primary
          />
        </ul>
      </section>

      {/* 5. Trailers ──────────────────────────────────────────────── */}
      <section className="mb-24 md:mb-32" aria-labelledby="trailers-heading">
        <h2
          id="trailers-heading"
          className="mb-8 font-display text-2xl font-bold text-[var(--text)]"
        >
          {t("trailersHeading")}
        </h2>
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]" role="list">
          {GAMES.map((g) => (
            <li
              key={g.slug}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-[var(--text)]">
                  {g.title.es}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {g.year}
                </p>
              </div>
              <PressTrailerButton gameTitle={g.title.es} />
            </li>
          ))}
        </ul>
      </section>

      {/* 6. Contacto de prensa ────────────────────────────────────── */}
      <section aria-labelledby="contact-heading">
        <h2
          id="contact-heading"
          className="mb-5 font-display text-2xl font-bold text-[var(--text)]"
        >
          {t("contactHeading")}
        </h2>
        <p className="mb-8 text-base leading-relaxed text-[var(--text-muted)]">
          {t("contactLine")}
        </p>
        <Button asChild size="lg" variant="outline">
          <a href={`mailto:${PRESS_EMAIL}`}>
            <Mail className="size-4" />
            {t("contactCta")}
          </a>
        </Button>
      </section>
    </div>
  );
}

function FactRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-4 sm:grid-cols-[12rem_1fr]">
      <dt className="text-sm text-[var(--text-muted)]">{label}</dt>
      <dd className="text-base text-[var(--text)]">{value}</dd>
    </div>
  );
}

function DownloadItem({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <li>
      <Button
        asChild
        size="lg"
        variant={primary ? "solid" : "outline"}
        className="w-full justify-start"
      >
        <a href={href} download>
          {label}
        </a>
      </Button>
    </li>
  );
}
