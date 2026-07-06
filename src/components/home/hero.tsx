import { getTranslations } from "next-intl/server";
import { ArrowRight, ChevronDown } from "lucide-react";
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
        <p className="intro mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[var(--text-subtle)]">
          {t("Brand.manifesto")}
        </p>

        <h1
          id="hero-title"
          className="intro-lcp font-display text-[clamp(3rem,12vw,9rem)] font-bold leading-[0.9] tracking-tight"
        >
          <span className="block">SHADOW</span>
          <span className="block text-[var(--accent)]">GAMES</span>
        </h1>

        <p className="intro intro-d2 mt-8 max-w-xl text-balance text-lg italic text-[var(--text-muted)] md:text-2xl">
          {t("Brand.tagline")}
        </p>

        <div className="intro intro-d3 mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="solid">
            <Link href="/juegos">
              {t("Hero.ctaGames")}
              <ArrowRight className="size-5" />
            </Link>
          </Button>

          <TrailerDialog />
        </div>
      </div>

      <div className="scroll-hint absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[var(--text-subtle)]">
        <ChevronDown className="size-6" aria-hidden />
      </div>
    </section>
  );
}
