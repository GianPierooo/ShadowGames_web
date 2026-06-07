import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@/lib/games";
import { cn } from "@/lib/cn";

interface GameCardProps {
  game: Game;
  /** Etiqueta traducida del estado (el padre la calcula con getTranslations). */
  statusLabel: string;
  className?: string;
}

/**
 * Tarjeta de juego para el grid.
 *
 * Fase 1: las imágenes de `public/games/<slug>/` aún no existen, así que
 * renderizamos un fallback de gradiente derivado de `accentColor`. En H2,
 * cuando haya key art, se sustituye el fallback por <Image src={game.cardArt}>.
 *
 * El overlay de hover usa transform/opacity (sin layout shift) y queda
 * visible siempre en pantallas táctiles (no hay hover fiable).
 */
export function GameCard({ game, statusLabel, className }: GameCardProps) {
  const accent = game.accentColor ?? "#8b5cf6";

  return (
    <Link
      href={{ pathname: "/juegos/[slug]", params: { slug: game.slug } }}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]",
        "border border-[var(--border)] bg-[var(--surface)]",
        "transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      aria-label={game.title.es}
    >
      {/* Fallback visual (gradiente). En H2 → <Image fill src={game.cardArt} /> */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
        style={{
          background: `radial-gradient(120% 100% at 30% 20%, ${accent}55 0%, transparent 55%), linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)`,
        }}
      >
        <span
          className="absolute inset-0 grid place-items-center font-display text-7xl font-bold opacity-10"
          aria-hidden
        >
          {game.title.es.charAt(0)}
        </span>
      </div>

      {/* Degradado inferior para legibilidad del texto */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Badge de estado */}
      <div className="absolute left-3 top-3 z-10">
        <Badge variant={game.status}>{statusLabel}</Badge>
      </div>

      {/* Indicador de hover */}
      <span
        className={cn(
          "absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full",
          "border border-white/20 bg-black/30 text-white backdrop-blur",
          "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        )}
        aria-hidden
      >
        <ArrowUpRight className="size-4" />
      </span>

      {/* Texto */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <h3 className="font-display text-xl font-bold leading-tight text-white">
          {game.title.es}
        </h3>
        <p
          className={cn(
            "mt-1 text-sm text-white/70",
            "max-h-0 overflow-hidden opacity-0 transition-all duration-300",
            "group-hover:mt-1.5 group-hover:max-h-16 group-hover:opacity-100",
          )}
        >
          {game.tagline.es}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wider text-white/70">
          {game.year} · {game.genres[0]}
        </p>
      </div>
    </Link>
  );
}
