"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface YouTubeTeaserProps {
  /** ID del vídeo de YouTube (no la URL). */
  youTubeId: string;
  /** Imagen de portada mostrada hasta el clic (evita cargar el iframe al abrir). */
  poster: string;
  /** Título accesible (nombre de la contribución). */
  title: string;
}

/**
 * Teaser de YouTube con montaje diferido: hasta el clic solo hay una portada
 * ligera; el <iframe> de YouTube no se monta (ni descarga) hasta que el
 * usuario pulsa reproducir. Mismo criterio de rendimiento que las demos.
 */
export function YouTubeTeaser({ youTubeId, poster, title }: YouTubeTeaserProps) {
  const t = useTranslations("Contributions");
  const [active, setActive] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={`${title} — teaser`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={t("watchTeaser")}
          className={cn(
            "group absolute inset-0 grid place-items-center",
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-[var(--accent)] focus-visible:ring-inset",
          )}
        >
          <Image src={poster} alt={title} fill sizes="100vw" className="object-cover" />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90"
          />
          <span className="relative z-10 flex flex-col items-center gap-3">
            <span
              className={cn(
                "grid size-16 place-items-center rounded-full md:size-20",
                "border border-white/25 bg-[var(--accent-deep)] text-white",
                "shadow-[var(--shadow-glow)] transition-transform duration-300 group-hover:scale-110",
              )}
            >
              <Play className="size-7 translate-x-0.5 md:size-9" fill="currentColor" />
            </span>
            <span className="font-display text-lg font-bold text-white md:text-xl">
              {t("watchTeaser")}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
