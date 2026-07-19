import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { GameImage } from "@/components/games/game-image";
import type { Game } from "@/lib/games";
import { cn } from "@/lib/cn";

interface GameCardProps {
  game: Game;
  /** Etiqueta traducida del estado (el padre la calcula con getTranslations). */
  statusLabel: string;
  className?: string;
  /**
   * "tile" (default): tarjeta 4:5 con cardArt (grid).
   * "banner": destacado apaisado con keyArt, título mayor y tagline siempre
   * visible (portada editorial del catálogo). Reutiliza las mismas piezas.
   */
  variant?: "tile" | "banner";
}

/**
 * Tarjeta de juego.
 *
 * `GameImage` intenta cargar el arte y cae sola al fallback de gradiente si el
 * archivo no existe; además hace blur-up de marca al cargar.
 *
 * Elevación de Fase 2 (sombra en capas + hairline) en reposo, con press/focus
 * coherentes. El tagline se revela en hover con un cross-fade suave
 * (grid-rows 0fr→1fr + opacity, easing estándar) — sin el salto del max-height.
 */
export function GameCard({
  game,
  statusLabel,
  className,
  variant = "tile",
}: GameCardProps) {
  const isBanner = variant === "banner";

  return (
    <Link
      href={{ pathname: "/juegos/[slug]", params: { slug: game.slug } }}
      className={cn(
        "group relative block overflow-hidden rounded-[var(--radius-card)]",
        isBanner ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/5]",
        "border border-[var(--border)] bg-[var(--surface)]",
        // Elevación base (Fase 2) + transición con la curva del sistema.
        "shadow-[var(--shadow-card)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] [transition-timing-function:var(--ease-standard)]",
        "hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card-hover)]",
        "motion-safe:active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      /* Sin aria-label: el accessible name se computa del contenido (h3 + meta). */
    >
      <GameImage
        src={isBanner ? game.keyArt : game.cardArt}
        alt={game.title.es}
        accentColor={game.accentColor}
        priority={isBanner}
        sizes={
          isBanner
            ? "(min-width: 1152px) 1152px, 100vw"
            : "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
        }
        className="transition-transform duration-[var(--dur-slow)] [transition-timing-function:var(--ease-standard)] group-hover:scale-105"
      />

      {/* Degradado de legibilidad: más fuerte y alto en el banner (título mayor).
          Garantiza contraste del texto blanco sobre cualquier imagen. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0",
          isBanner
            ? "h-4/5 bg-gradient-to-t from-black/92 via-black/68 to-transparent"
            : "h-2/3 bg-gradient-to-t from-black/88 via-black/48 to-transparent",
        )}
      />

      {/* Badge de estado */}
      <div className="absolute left-3 top-3 z-10">
        <Badge variant={game.status}>{statusLabel}</Badge>
      </div>

      {/* Indicador de hover (flecha) */}
      <span
        className={cn(
          "absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full",
          "border border-white/20 bg-black/30 text-white backdrop-blur",
          "opacity-0 transition-opacity duration-[var(--dur-base)] [transition-timing-function:var(--ease-standard)] group-hover:opacity-100",
        )}
        aria-hidden
      >
        <ArrowUpRight className="size-4" />
      </span>

      {/* Texto */}
      <div className={cn("absolute inset-x-0 bottom-0 z-10", isBanner ? "p-6 md:p-8" : "p-4")}>
        <h3
          className={cn(
            "font-display font-bold leading-tight text-white text-pretty",
            isBanner ? "t-h2" : "text-xl",
          )}
        >
          {game.title.es}
        </h3>

        {isBanner ? (
          /* En el banner el tagline es parte del reposo (protagonista). */
          <p className="mt-2 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            {game.tagline.es}
          </p>
        ) : (
          /* Reveal del tagline en hover: cross-fade SUAVE. `grid-rows 0fr→1fr`
             sustituye al `max-height` (que "saltaba"); opacidad con easing
             estándar. En reduced-motion el cambio es instantáneo (sin animación). */
          <div
            className={cn(
              "grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--dur-base)]",
              "[transition-timing-function:var(--ease-standard)] group-hover:grid-rows-[1fr]",
              "motion-reduce:transition-none",
            )}
          >
            <p
              className={cn(
                "overflow-hidden pt-1.5 text-sm leading-snug text-white/85 opacity-0",
                "transition-opacity duration-[var(--dur-base)] [transition-timing-function:var(--ease-standard)]",
                "group-hover:opacity-100 motion-reduce:transition-none",
              )}
            >
              {game.tagline.es}
            </p>
          </div>
        )}

        <p
          className={cn(
            "uppercase tracking-wider text-white/75",
            isBanner ? "mt-3 text-xs md:text-sm" : "mt-2 text-xs",
          )}
        >
          {game.year} · {game.genres[0]}
        </p>
      </div>
    </Link>
  );
}
