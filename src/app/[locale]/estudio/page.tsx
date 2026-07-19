import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CharacterSelect } from "@/components/estudio/character-select";
import { Reveal } from "@/components/motion/reveal";
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

      {/* 2. Manifiesto — ritmo editorial ───────────────────────────────── */}
      {/* TODO: bio real — sustituir Studio.bioP1..P4 en es.json cuando el
          cliente pase la copia definitiva. Hasta entonces, placeholder
          coherente con "Mundos con sombra, hechos a mano".

          Se rompe el muro de prosa en movimientos con aire: LEAD (color pleno)
          → sombra como material → respiro (pull-quote) → cortos y densos. Cada
          movimiento entra al scroll con Reveal (--ease-out, cascada líder→
          secundario); en reduced-motion todo queda visible y compuesto. */}
      <section className="section-y px-6" aria-label="Manifiesto">
        <div className="mx-auto max-w-prose">
          {/* Movimiento 1 — lead + la sombra como material */}
          <Reveal stagger>
            <p className="text-pretty text-xl leading-relaxed text-[var(--text)] md:text-2xl">
              {t("bioP1")}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
              {t("bioP2")}
            </p>
          </Reveal>

          {/* Respiro — pull-quote sobrio (barra de acento por estilo inline: un
              `* { border-color }` SIN capa en globals.css gana a las utilidades
              border-[color]; el inline sí lo vence). Sin comillas decorativas. */}
          <Reveal>
            <blockquote
              className="my-12 border-l-2 pl-6 text-balance font-display text-2xl leading-snug text-[var(--text)] md:my-16 md:text-3xl"
              style={{ borderColor: "color-mix(in oklab, var(--accent) 50%, transparent)" }}
            >
              {t("manifestoPull")}
            </blockquote>
          </Reveal>

          {/* Movimiento 2 — cortos y densos / sin prisa */}
          <Reveal stagger>
            <p className="text-lg leading-relaxed text-[var(--text-muted)]">
              {t("bioP3")}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
              {t("bioP4")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. Tres principios — pilares editoriales ───────────────────────── */}
      {/* Numerados, título en .t-h3, separados por hairline y con aire, para que
          se lean como pilares y no como lista. Sin cajas ni iconos (PRINCIPLES).
          El índice (01/02/03) va en muted (≥7:1 en ambos temas; el acento no lo
          alcanzaría). Cada pilar entra al scroll con una cascada leve. */}
      <section className="px-6 pb-24 md:pb-32" aria-labelledby="principles-heading">
        <div className="mx-auto max-w-prose">
          <Reveal>
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)] md:mb-10">
              Cómo trabajamos
            </p>
          </Reveal>
          <h2 id="principles-heading" className="sr-only">
            Principios del estudio
          </h2>
          <ol className="flex flex-col" role="list">
            {([1, 2, 3] as const).map((n) => (
              <Reveal
                as="li"
                key={n}
                y={16}
                delay={(n - 1) * 0.08}
                className={
                  n === 1
                    ? "pt-0"
                    : "mt-8 border-t border-[var(--border)] pt-8 md:mt-10 md:pt-10"
                }
              >
                <div className="flex items-baseline gap-4 md:gap-5">
                  <span
                    aria-hidden
                    className="font-display text-base font-semibold tabular-nums text-[var(--text-muted)]"
                  >
                    0{n}
                  </span>
                  <h3 className="t-h3 font-display font-bold text-[var(--text)]">
                    {t(`principle${n}Title` as const)}
                  </h3>
                </div>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)] md:pl-[2.6rem]">
                  {t(`principle${n}Body` as const)}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3.5. El equipo — humanidad ─────────────────────────────────────── */}
      {/* Composición editorial ASIMÉTRICA (no bloque centrado): eyebrow + h2 a
          la izquierda, lead humano a la derecha; debajo, el "character select"
          interactivo (dos personas reales). Entra al scroll.

          Copy del lead: real y estructural (no inventa datos) — el detalle
          humano por persona (rol + tagline) vive en <CharacterSelect>, marcado
          `TODO(Leo)` para afinar. Si quieres una frase más personal a nivel de
          sección, este <p> es el sitio para sustituirla. */}
      <section
        className="border-t border-[var(--border)] px-6 py-20 md:py-28"
        aria-labelledby="team-heading"
      >
        <div className="mx-auto max-w-5xl">
          <Reveal
            stagger
            className="grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-end md:gap-14"
          >
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
                Quiénes estamos detrás
              </p>
              <h2
                id="team-heading"
                className="font-display t-h2 font-bold text-[var(--text)]"
              >
                El equipo
              </h2>
            </div>
            <p className="text-pretty text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
              Detrás de cada juego estamos solo dos personas: uno pone el código,
              el otro el arte, y lo demás lo decidimos entre los dos.
            </p>
          </Reveal>

          <Reveal className="mt-12 md:mt-16" y={16}>
            <CharacterSelect />
          </Reveal>
        </div>
      </section>

      {/* 4. Cierre — una línea + un único CTA hacia /contacto ──────────── */}
      <section className="px-6 pb-24 md:pb-32" aria-label="Contacto">
        <Reveal
          stagger
          className="mx-auto flex max-w-prose flex-col items-center gap-7 text-center"
        >
          <p className="text-lg italic text-[var(--text-muted)]">
            {t("closingLine")}
          </p>
          <Button asChild size="lg" variant="solid">
            <Link href={{ pathname: "/contacto" }}>{t("closingCta")}</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
