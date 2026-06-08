"use client";

import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Botón "Ver tráiler" para la lista de trailers de /press.
 *
 * Mismo patrón visual que `<TrailerDialog>` del home, pero el título del
 * dialog es el del juego en cuestión (para accesibilidad y contexto cuando
 * hay 10 botones idénticos en la página).
 *
 * En fase 1 todos los juegos comparten el mismo contenido "próximamente"
 * porque ningún `game.trailer` está definido aún (PRINCIPLES: cero
 * placeholders decorativos en producción; aquí el dialog SÍ tiene sentido
 * porque la prensa espera ver algo y el modal explica el estado real).
 */
export function PressTrailerButton({ gameTitle }: { gameTitle: string }) {
  const t = useTranslations("Press");
  const tHero = useTranslations("Hero");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Play className="size-4" />
          {/* sr-only contextualiza qué juego, sin romper la regla
              label-content-name-mismatch (el texto visible "Ver tráiler"
              sigue siendo subcadena del nombre accesible). */}
          <span className="sr-only">{gameTitle} — </span>
          {t("trailerWatch")}
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
                {gameTitle}
              </DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
                {tHero("trailerComingSoon")}
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
