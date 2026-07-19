"use client";

/**
 * Imagen de juego con fallback cinematográfico.
 *
 * Fase 1→2 (transición): la mayoría de rutas `/games/<slug>/...` aún no
 * existen. Este componente INTENTA cargar `src`; si el archivo no existe
 * (404) o falla, cae automáticamente al fallback (gradiente + viñeta +
 * inicial sutil) — así los juegos sin assets reales siguen viéndose igual
 * que antes, y los que ya tienen key art (p.ej. econexo) se muestran solos,
 * sin tocar nada más.
 */

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Placeholder de marca para el blur-up NATIVO de next/image: un gradiente
 * violeta→tinta (8×10, 122 B). next/image lo pinta difuminado mientras la
 * imagen real carga y hace el cross-fade solo — funciona SIN JS (no depende de
 * onLoad/hidratación) y da un "fondo de color de marca" en vez de aparecer en
 * seco. Genérico (no por juego): coherente con la penumbra.
 */
const BRAND_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAKCAIAAAAGpYjXAAAAQUlEQVR4nGNQkDDDihjkxI2wIgYZUX2siEFKRBsrYpAQ1sCKGMQEVbAiBhEBRayIQYhfFitiEOCVwooY+HjEsCIAxS0YsVFH6jwAAAAASUVORK5CYII=";

interface GameImageProps {
  /** Ruta del asset (`/games/<slug>/...`). Si no existe, se usa el fallback. */
  src: string;
  /** Texto alternativo de la imagen real. */
  alt: string;
  /** Color de acento del juego (gradiente del placeholder). */
  accentColor?: string;
  /** Letra grande sutil de fondo (decorativa). Por defecto, la 1ª del alt. */
  initial?: string;
  className?: string;
  /** Cuando true, oculta la inicial decorativa (útil en el hero, p.ej.). */
  hideInitial?: boolean;
  /** Hint de tamaño responsive (evita sobre-descargar). Default: 100vw. */
  sizes?: string;
  /** Above-the-fold (p.ej. el banner destacado): carga con prioridad. */
  priority?: boolean;
}

export function GameImage({
  src,
  alt,
  accentColor,
  initial,
  className,
  hideInitial = false,
  sizes = "100vw",
  priority = false,
}: GameImageProps) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BRAND_BLUR}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  const accent = accentColor ?? "#8b5cf6";
  const char = (initial ?? alt.charAt(0)).toUpperCase();

  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        background: `radial-gradient(120% 100% at 30% 20%, ${accent}55 0%, transparent 55%), linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)`,
      }}
      aria-hidden
    >
      {!hideInitial && (
        <span
          className="absolute inset-0 grid place-items-center font-display text-[20rem] font-bold leading-none text-white/[0.04]"
          aria-hidden
        >
          {char}
        </span>
      )}
    </div>
  );
}
