import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Studio");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: routeAlternates("/estudio"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/es/estudio",
    },
  };
}

/**
 * /estudio — Página del estudio (manifiesto).
 *
 * Override de MASTER.md documentado en
 * `design-system/shadow-games-studio/pages/estudio.md`.
 *
 * Referencia tonal: About de Playdead + Annapurna. Una sola columna
 * `max-w-prose`, aire generoso, prosa narrativa. NO corporate ("nuestros
 * valores en grid"), NO timeline, NO tarjetas de equipo, NO estadísticas.
 *
 * Bio: placeholder hasta que el cliente pase la copia real. Buscar
 * `TODO: bio real` para sustituir.
 */
export default async function StudioPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Studio");

  return (
    <>
      {/* 1. Intro visual cinematográfica (fullbleed, ~80svh) ─────────── */}
      <section
        className="relative flex min-h-[80svh] items-center overflow-hidden"
        aria-labelledby="manifesto-heading"
      >
        {/* Backdrop sobrio: mesh quieto (sin animación, sin partículas),
            distinto del hero del home — aquí toca silencio. Violeta marca,
            cero accentColor de juego. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 overflow-hidden bg-[var(--bg)]"
        >
          <div
            className="absolute"
            style={{
              width: "60vw",
              height: "60vw",
              left: "-8%",
              top: "-18%",
              background:
                "radial-gradient(circle, rgba(139,92,246,0.32) 0%, rgba(139,92,246,0) 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute"
            style={{
              width: "52vw",
              height: "52vw",
              right: "-10%",
              bottom: "-20%",
              background:
                "radial-gradient(circle, rgba(109,74,214,0.28) 0%, rgba(109,74,214,0) 70%)",
              filter: "blur(60px)",
            }}
          />
          {/* Viñeta */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, var(--bg) 100%)",
            }}
          />
        </div>

        <div className="relative w-full px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-[var(--text-subtle)]">
              {t("eyebrow")}
            </p>
            <h1
              id="manifesto-heading"
              className="font-display font-bold leading-[1.05] tracking-tight text-balance text-[var(--text)]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              {t("manifestoHeading")}
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Manifiesto largo (prosa narrativa) ─────────────────────────── */}
      {/* TODO: bio real — sustituir Studio.bioP1..P4 en es.json cuando el
          cliente pase la copia definitiva. Hasta entonces, placeholder
          coherente con "Mundos con sombra, hechos a mano". */}
      <section className="section-y px-6" aria-label="Manifiesto">
        <div className="mx-auto max-w-prose space-y-6 text-lg leading-relaxed text-[var(--text-muted)]">
          <p>{t("bioP1")}</p>
          <p>{t("bioP2")}</p>
          <p>{t("bioP3")}</p>
          <p>{t("bioP4")}</p>
        </div>
      </section>

      {/* 3. Tres principios (texto puro, sin grid ni iconos) ───────────── */}
      <section
        className="px-6 pb-24 md:pb-32"
        aria-labelledby="principles-heading"
      >
        <div className="mx-auto max-w-prose">
          <h2 id="principles-heading" className="sr-only">
            Principios del estudio
          </h2>
          <ol className="space-y-12" role="list">
            {([1, 2, 3] as const).map((n) => (
              <li key={n}>
                <h3 className="font-display text-2xl font-bold leading-tight text-[var(--text)]">
                  {t(`principle${n}Title` as const)}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">
                  {t(`principle${n}Body` as const)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Cierre — una línea + un único CTA hacia /contacto ──────────── */}
      <section className="px-6 pb-24 md:pb-32" aria-label="Contacto">
        <div className="mx-auto flex max-w-prose flex-col items-center gap-7 text-center">
          <p className="text-lg italic text-[var(--text-muted)]">
            {t("closingLine")}
          </p>
          <Button asChild size="lg" variant="solid">
            <Link href={{ pathname: "/contacto" }}>{t("closingCta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
