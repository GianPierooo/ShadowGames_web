"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Download, Maximize, Minimize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameImage } from "@/components/games/game-image";
import { cn } from "@/lib/cn";
import type { GameDemo } from "@/lib/games";

interface DemoSectionProps {
  demo: GameDemo;
  /** Key art del juego, usado como portada del reproductor. */
  keyArt: string;
  /** Título del juego (para `alt`, títulos de iframe y aria-labels). */
  gameTitle: string;
  /** Acento puntual del juego (glow); por defecto el violeta de marca. */
  accentColor?: string;
}

/**
 * Sección "Demo" de la página de detalle. Renderiza SEGÚN el tipo de demo:
 *
 *  - embed    → portada + "▶ Jugar demo"; el <iframe> del build HTML5/WebGL
 *               NO se monta hasta el clic (montaje condicional). Al jugar:
 *               contenedor responsive con aspect-ratio + pantalla completa + cerrar.
 *  - video    → portada + "▶ Ver tráiler"; el reproductor (YouTube o <video>)
 *               tampoco se monta hasta el clic.
 *  - download → botón "⬇ Descargar demo (…)" que enlaza al build.
 *
 * RENDIMIENTO: al ser client component con montaje condicional, nada del
 * iframe/vídeo entra en el HTML del server ni se descarga al abrir la página;
 * solo tras la interacción del usuario.
 */
export function DemoSection({ demo, keyArt, gameTitle, accentColor }: DemoSectionProps) {
  const t = useTranslations("Games");

  if (demo.kind === "download") {
    return (
      <div className="mx-auto flex max-w-prose flex-col items-center gap-4">
        <Button asChild size="lg" variant="solid">
          <a href={demo.url} target="_blank" rel="noopener noreferrer" download>
            <Download className="size-5" />
            {t("demoDownload", { platform: demo.platform })}
          </a>
        </Button>
        <p className="text-sm text-[var(--text-subtle)]">{t("demoDownloadHint")}</p>
      </div>
    );
  }

  // embed | video → reproductor diferido con portada.
  const label = demo.kind === "embed" ? t("demoPlay") : t("demoTrailer");
  const aspectRatio = demo.kind === "embed" ? (demo.aspectRatio ?? 16 / 9) : 16 / 9;

  return (
    <DeferredPlayer
      label={label}
      keyArt={keyArt}
      gameTitle={gameTitle}
      accentColor={accentColor}
      aspectRatio={aspectRatio}
      renderContent={() =>
        demo.kind === "embed" ? (
          // Build HTML5/WebGL jugable en la misma página.
          // sandbox mínimo necesario: allow-scripts (ejecutar el juego),
          // allow-same-origin (self-host: el build hace fetch de .wasm/.pck/.data
          // y usa localStorage — sin esto, origen opaco y no carga),
          // allow-pointer-lock (juegos con mouse-look). `allow="fullscreen"` +
          // allowFullScreen para que el build pueda pedir pantalla completa.
          <iframe
            src={demo.url}
            title={`${gameTitle} — demo`}
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            allow="fullscreen; autoplay; gamepad; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
          />
        ) : demo.provider === "youtube" ? (
          <iframe
            src={youtubeEmbedSrc(demo.url)}
            title={`${gameTitle} — ${label}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video
            src={demo.url}
            className="absolute inset-0 h-full w-full bg-black"
            controls
            autoPlay
            playsInline
          />
        )
      }
    />
  );
}

interface DeferredPlayerProps {
  label: string;
  keyArt: string;
  gameTitle: string;
  accentColor?: string;
  aspectRatio: number;
  /** Contenido pesado (iframe/vídeo). Solo se invoca cuando `active` es true. */
  renderContent: () => React.ReactNode;
}

/**
 * Portada + botón de reproducción. El contenido pesado (`renderContent`) solo
 * se MONTA cuando el usuario pulsa "reproducir" (`active`), y se DESMONTA al
 * cerrar (libera el iframe/vídeo y detiene el sonido). Incluye pantalla
 * completa (Fullscreen API sobre el contenedor) y botón de cerrar/volver.
 */
function DeferredPlayer({
  label,
  keyArt,
  gameTitle,
  accentColor,
  aspectRatio,
  renderContent,
}: DeferredPlayerProps) {
  const t = useTranslations("Games");
  const [active, setActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Sincroniza el estado de pantalla completa con el navegador (Esc, gestos…).
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  }, []);

  const close = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    setActive(false);
  }, []);

  const accent = accentColor ?? "#8b5cf6";

  return (
    <div className="mx-auto max-w-4xl">
      <div
        ref={frameRef}
        className={cn(
          "group relative w-full overflow-hidden rounded-[var(--radius-lg)]",
          "border border-[var(--border)] bg-[var(--surface)]",
          "shadow-[var(--shadow-card)]",
        )}
        style={{ aspectRatio: String(aspectRatio) }}
      >
        {active ? (
          <>
            {renderContent()}
            {/* Controles sobre el reproductor: pantalla completa + cerrar. */}
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? t("demoExitFullscreen") : t("demoFullscreen")}
                className={controlBtn}
              >
                {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={t("demoClose")}
                className={controlBtn}
              >
                <X className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={label}
            className={cn(
              "absolute inset-0 grid place-items-center",
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--accent)] focus-visible:ring-inset",
            )}
          >
            {/* Portada = key art del juego (fallback de marca hasta que existan assets). */}
            <GameImage src={keyArt} alt={gameTitle} initial={gameTitle.charAt(0)} />
            {/* Velo para legibilidad del botón sobre la portada. */}
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90"
            />
            {/* Glow puntual con el acento del juego, detrás del botón. */}
            <span
              aria-hidden
              className="pointer-events-none absolute size-40 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90"
              style={{ background: `radial-gradient(circle, ${accent}88 0%, transparent 70%)` }}
            />
            <span className="relative z-10 flex flex-col items-center gap-4">
              <span
                className={cn(
                  "grid size-16 place-items-center rounded-full md:size-20",
                  "border border-white/25 bg-[var(--accent-deep)] text-white",
                  "shadow-[var(--shadow-glow)] transition-transform duration-300",
                  "group-hover:scale-110",
                )}
              >
                <Play className="size-7 translate-x-0.5 md:size-9" fill="currentColor" />
              </span>
              <span className="font-display text-xl font-bold text-white md:text-2xl">
                {label}
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** Estilo compartido de los botones de control (≥44px táctil, accesible). */
const controlBtn = cn(
  "grid size-11 place-items-center rounded-full",
  "border border-white/20 bg-black/60 text-white backdrop-blur",
  "transition-colors hover:bg-black/80 hover:border-[var(--accent)]",
  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
);

/**
 * Normaliza un ID o URL de YouTube a la URL de embed (dominio sin cookies,
 * autoplay, sin vídeos relacionados de otros canales).
 */
function youtubeEmbedSrc(idOrUrl: string): string {
  let id = idOrUrl.trim();
  const m = idOrUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  );
  if (m) id = m[1]!;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
