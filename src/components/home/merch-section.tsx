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
      className="grain cv-auto section-y relative px-6"
      aria-labelledby="merch-heading"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <header className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {t("merchEyebrow")}
            </p>
            <h2
              id="merch-heading"
              className="font-display t-h2 font-bold"
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
              {/* Placeholder sobrio. El estado "próximamente" lo da una sola
                  vez el badge de la cabecera; PRINCIPLES: sin repetir la
                  etiqueta en cada slot. */}
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface)]/40">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,var(--surface-2),var(--bg))] opacity-60" />
                <div className="absolute inset-0 grid place-items-center text-[var(--text-subtle)]">
                  <Sparkles className="size-8" aria-hidden />
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
