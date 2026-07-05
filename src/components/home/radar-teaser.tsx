import { getTranslations } from "next-intl/server";
import { Radar, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Teaser discreto del Radar de Jams en el home. Franja sobria que enlaza a
 * /jams sin competir con el hero ni con las secciones de juego/estudio.
 */
export async function RadarTeaser() {
  const t = await getTranslations("Home");

  return (
    <section className="cv-auto section-y relative px-6" aria-labelledby="radar-teaser-heading">
      <Reveal>
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/40 px-7 py-8 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-[var(--radius-card)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]"
            >
              <Radar className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
                {t("radarEyebrow")}
              </p>
              <h2
                id="radar-teaser-heading"
                className="font-display text-2xl font-bold tracking-tight md:text-3xl"
              >
                {t("radarTitle")}
              </h2>
              <p className="max-w-xl text-[var(--text-muted)]">{t("radarBody")}</p>
            </div>
          </div>

          <Button asChild size="md" variant="solid" className="shrink-0">
            <Link href="/jams">
              {t("radarCta")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
