"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GameImage } from "@/components/games/game-image";
import { cn } from "@/lib/cn";

interface ScreenshotsGalleryProps {
  /** Rutas absolutas (`/games/<slug>/screen-N.jpg`). */
  shots: string[];
  /** Título del juego (para `alt` y el DialogTitle de la lightbox). */
  gameTitle: string;
  /** Color de acento del juego (para el gradiente del placeholder). */
  accentColor?: string;
}

/**
 * Galería sobria con lightbox. Sin captions, sin números, sin nav entre slides
 * (PRINCIPLES: cero chrome). Reutiliza `<GameImage>` para el fallback durante
 * fase 1; cuando haya assets, sustituir GameImage por <Image>.
 */
export function ScreenshotsGallery({ shots, gameTitle, accentColor }: ScreenshotsGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  if (shots.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "group relative block aspect-video w-full overflow-hidden rounded-[var(--radius-card)]",
                "cursor-pointer border border-[var(--border)] bg-[var(--surface)]",
                "transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
              )}
              aria-label={`${gameTitle} — captura ${i + 1}`}
            >
              <GameImage
                src={src}
                alt={`${gameTitle} — captura ${i + 1}`}
                accentColor={accentColor}
                initial={String(i + 1)}
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(v) => setOpen(v ? open : null)}>
        <DialogContent className="max-w-5xl overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {open !== null ? `${gameTitle} — captura ${open + 1}` : gameTitle}
          </DialogTitle>
          {open !== null && (
            <div className="relative aspect-video w-full">
              <GameImage
                src={shots[open]!}
                alt={`${gameTitle} — captura ${open + 1}`}
                accentColor={accentColor}
                initial={String(open + 1)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
