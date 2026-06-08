/**
 * Imagen de juego con fallback cinematográfico.
 *
 * Fase 1: las rutas `/games/<slug>/...` aún no existen. Este componente
 * SIEMPRE renderiza el fallback (gradiente + viñeta + inicial sutil).
 *
 * Cuando lleguen los assets, sustituir el contenido de este componente
 * por `<Image src={src} fill ... />` y este será el único punto a tocar.
 */

import { cn } from "@/lib/cn";

interface GameImageProps {
  /** Ruta del asset cuando exista (`/games/<slug>/...`). Hoy ignorada. */
  src: string;
  /** Texto alternativo si se renderiza la imagen real. */
  alt: string;
  /** Color de acento del juego (gradiente del placeholder). */
  accentColor?: string;
  /** Letra grande sutil de fondo (decorativa). Por defecto, la 1ª del alt. */
  initial?: string;
  className?: string;
  /** Cuando true, oculta la inicial decorativa (útil en el hero, p.ej.). */
  hideInitial?: boolean;
}

export function GameImage({
  src,
  alt,
  accentColor,
  initial,
  className,
  hideInitial = false,
}: GameImageProps) {
  void src; // TODO(H2 assets): sustituir por <Image src={src} ... /> cuando existan archivos.
  void alt; // se cumple semántica con role+aria-label del wrapper

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
