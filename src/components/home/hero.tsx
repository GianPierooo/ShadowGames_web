"use client";

import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Play, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Hero() {
  const t = useTranslations();

  // Sin ramificar por reduced-motion (evita hydration mismatch). MotionConfig
  // reducedMotion="user" conserva el fade y desactiva el slide para quien lo pida.
  const motionProps = {
    variants: container,
    initial: "hidden" as const,
    animate: "show" as const,
  };
  const childProps = { variants: item };

  return (
    <section
      className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center"
      aria-labelledby="hero-title"
    >
      <HeroBackdrop />

      <motion.div className="relative z-10 flex max-w-4xl flex-col items-center" {...motionProps}>
        <motion.p
          className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[var(--text-subtle)]"
          {...childProps}
        >
          {t("Brand.manifesto")}
        </motion.p>

        <motion.h1
          id="hero-title"
          className="font-display text-[clamp(3rem,12vw,9rem)] font-bold leading-[0.9] tracking-tight"
          {...childProps}
        >
          <span className="block">SHADOW</span>
          <span className="block text-[var(--accent)]">GAMES</span>
        </motion.h1>

        <motion.p
          className="mt-8 max-w-xl text-balance text-lg italic text-[var(--text-muted)] md:text-2xl"
          {...childProps}
        >
          {t("Brand.tagline")}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
          {...childProps}
        >
          <Button asChild size="lg" variant="solid">
            <Link href="/juegos">
              {t("Hero.ctaGames")}
              <ArrowRight className="size-5" />
            </Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <Play className="size-4" />
                {t("Hero.ctaTrailer")}
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0">
              <div className="relative aspect-video w-full">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--surface-2),var(--bg))]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <span className="grid size-16 place-items-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)]">
                      <Play className="size-7 text-[var(--accent)]" />
                    </span>
                    <DialogTitle className="font-display text-2xl font-bold">
                      {t("Hero.ctaTrailer")}
                    </DialogTitle>
                    <DialogDescription className="text-[var(--text-muted)]">
                      {t("Hero.trailerComingSoon")}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      <div className="scroll-hint absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[var(--text-subtle)]">
        <ChevronDown className="size-6" aria-hidden />
      </div>
    </section>
  );
}
