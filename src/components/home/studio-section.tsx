import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Sección "El estudio" — dos columnas: copy + key art.
 * El copy y el key art son placeholders hasta recibir la bio real y el arte.
 */
export async function StudioSection() {
  const t = await getTranslations("Home");

  return (
    <section
      className="relative border-t border-[var(--border)] px-6 py-24 md:py-32"
      aria-labelledby="studio-heading"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <div className="flex flex-col gap-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {t("studioTitle")}
            </p>
            <h2
              id="studio-heading"
              className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            >
              {t("studioTitle")}
            </h2>
            <p className="max-w-prose text-lg leading-relaxed text-[var(--text-muted)]">
              {t("studioBody")}
            </p>
            <div>
              <Button asChild size="md" variant="outline">
                <Link href="/estudio">
                  {t("studioCta")}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Key art (placeholder cinematográfico, ratio 4:5 con viñeta) */}
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_20%,rgba(139,92,246,0.4)_0%,transparent_55%),linear-gradient(200deg,var(--surface-2),var(--bg))]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
            <span
              className="absolute inset-0 grid place-items-center font-display text-[12rem] font-bold leading-none text-white/[0.04]"
              aria-hidden
            >
              S
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
