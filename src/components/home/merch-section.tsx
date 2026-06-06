import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

// 4 placeholders elegantes, sin precios ni nombres reales.
const SLOTS = [0, 1, 2, 3] as const;

/**
 * "SHADOW STUFF" — sección de merch en estado PRÓXIMAMENTE.
 * Placeholders con silueta y etiqueta; sin precios (todavía no hay tienda).
 */
export async function MerchSection() {
  const t = await getTranslations("Home");

  return (
    <section
      className="grain relative border-t border-[var(--border)] px-6 py-24 md:py-32"
      aria-labelledby="merch-heading"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <header className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {t("merchTitle")}
            </p>
            <h2
              id="merch-heading"
              className="font-display text-4xl font-bold tracking-tight md:text-6xl"
            >
              SHADOW STUFF
            </h2>
            <Badge variant="coming-soon" className="mt-2">
              {t("merchSubtitle")}
            </Badge>
            <p className="mt-2 max-w-md text-[var(--text-muted)]">{t("merchBody")}</p>
          </header>
        </Reveal>

        <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {SLOTS.map((i) => (
            <Reveal as="li" key={i} delay={i * 0.06}>
              <div className="group relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface)]/40">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,var(--surface-2),var(--bg))] opacity-60" />
                <div className="absolute inset-0 grid place-items-center text-[var(--text-subtle)]">
                  <Sparkles className="size-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                  <span className="text-xs uppercase tracking-widest text-[var(--text-subtle)]">
                    {t("merchSubtitle")}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
