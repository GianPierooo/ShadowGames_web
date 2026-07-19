import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { TrailerDialog } from "@/components/home/trailer-dialog";
import { Button } from "@/components/ui/button";

/**
 * Hero del home — server component.
 *
 * La entrada (fade + slide escalonado) se hace con animación CSS pura
 * (clases .intro / .intro-lcp en globals.css), NO con Motion. Motivo: el h1
 * es el elemento LCP; con Motion arrancaba en opacity:0 hasta que React
 * hidrataba, disparando el LCP a ~4s. Con CSS la animación empieza en el
 * primer paint y el h1 (.intro-lcp) se mantiene opaco — LCP inmediato.
 *
 * Al no depender de hooks de cliente, este componente vuelve a ser server
 * (menos JS en el bundle). TrailerDialog sigue siendo client y se anida sin
 * problema.
 */
export async function Hero() {
  const t = await getTranslations();

  return (
    <section
      // El hero es un panel cinematográfico oscuro en AMBOS temas: fuerza la
      // paleta dark localmente (texto claro sobre el video de gameplay oscuro).
      // El resto de la página sigue respetando el tema del usuario. Sin esto,
      // en modo día el video oscuro no se veía bajo el texto oscuro.
      data-theme="dark"
      className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center"
      aria-labelledby="hero-title"
    >
      <HeroBackdrop />

      <div className="hero-legible relative z-10 flex max-w-4xl flex-col items-center text-[var(--text)]">
        <p className="hero-eyebrow mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[var(--text-subtle)]">
          {t("Brand.manifesto")}
        </p>

        {/* Wordmark: adopta .t-display (Fase 2). Cada palabra sube opaca tras su
            línea-máscara (SHADOW y luego GAMES). El h1 nunca es opacity:0 → el
            texto se pinta al instante y el LCP no se degrada. */}
        <h1
          id="hero-title"
          className="font-display t-display font-bold text-[var(--text)]"
        >
          <span className="word-mask">
            <span className="word-rise">SHADOW</span>
          </span>
          <span className="word-mask">
            <span className="word-rise w2 text-[var(--accent)]">GAMES</span>
          </span>
        </h1>

        {/* Tagline: mask-rise completo (emerge desde una línea oculta). */}
        <p className="hero-tagline mt-8 max-w-xl text-balance text-lg italic text-[var(--text-muted)] md:text-2xl">
          <span className="line-mask">
            <span className="line-rise">{t("Brand.tagline")}</span>
          </span>
        </p>

        <div className="hero-cta mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="solid">
            <Link href="/juegos">
              {t("Hero.ctaGames")}
              <ArrowRight className="size-5" />
            </Link>
          </Button>

          <TrailerDialog />
        </div>
      </div>
    </section>
  );
}
