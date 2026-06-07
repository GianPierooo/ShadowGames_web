"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

// FilterBar es específico de /juegos; hardcodear el destino evita la unión de
// pathnames (incluida la ruta dinámica /juegos/[slug]) que rechaza el typing
// del router tipado de next-intl.
const ROUTE = "/juegos" as const;
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  STATUS_ORDER,
  STATUS_VALUE_TO_SLUG,
  slugifyGenre,
} from "@/lib/filters";
import type { GameStatus } from "@/lib/games";
import { cn } from "@/lib/cn";

interface FilterBarProps {
  /** Géneros disponibles en el catálogo, ya ordenados. */
  genres: string[];
  /** Etiquetas traducidas de los estados (pasadas desde el server). */
  statusLabels: Record<GameStatus, string>;
  /** Cuenta el server: número de juegos que coinciden con los filtros actuales. */
  resultsLabel: string;
  /** Estado actual decodificado (para resaltar la pill activa). */
  current: { estado: string | null; genero: string | null };
}

/**
 * Barra de filtros sticky para /juegos.
 *
 * El estado canónico vive en la URL (searchParams). El server filtra; este
 * componente solo actualiza la URL con `router.replace(..., {scroll:false})`
 * para no saturar el historial ni saltar el scroll al cambiar de filtro.
 *
 * Mantenemos los filtros tipados en español en la URL (slugs `disponible`,
 * `early-access`, etc.) por SEO local y URLs compartibles legibles.
 */
export function FilterBar({
  genres,
  statusLabels,
  resultsLabel,
  current,
}: FilterBarProps) {
  const t = useTranslations("Games");
  const tStatus = useTranslations("Status");
  void tStatus; // las etiquetas vienen pre-traducidas por prop
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: "estado" | "genero", value: string | null) => {
      // Construyo el objeto query a partir de los params actuales y aplico el
      // cambio. Usar la forma objeto { pathname, query } evita el typing
      // hostil del router tipado de next-intl con strings con "?".
      const query: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        query[k] = v;
      });
      if (value === null) delete query[key];
      else query[key] = value;
      startTransition(() => {
        router.replace({ pathname: ROUTE, query }, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.replace({ pathname: ROUTE, query: {} }, { scroll: false });
    });
  }, [router]);

  const hasFilters = current.estado !== null || current.genero !== null;
  const currentGenreLabel = useMemo(() => {
    if (!current.genero) return t("filterAllGenres");
    const match = genres.find((g) => slugifyGenre(g) === current.genero);
    return match ?? t("filterAllGenres");
  }, [current.genero, genres, t]);

  return (
    <div
      className={cn(
        "sticky top-24 z-30",
        "border-y border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl",
        pending && "opacity-90",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Estado: pills horizontales con scroll en mobile */}
        <div
          role="radiogroup"
          aria-label={t("filterStatus")}
          className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <StatusPill
            label={t("filterAll")}
            active={current.estado === null}
            onClick={() => setParam("estado", null)}
          />
          {STATUS_ORDER.map((status) => {
            const slug = STATUS_VALUE_TO_SLUG[status];
            return (
              <StatusPill
                key={status}
                label={statusLabels[status]}
                active={current.estado === slug}
                onClick={() => setParam("estado", slug)}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Género: dropdown radix */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)]",
                  "border border-[var(--border)] bg-[var(--surface)]/60 px-4 text-sm font-medium",
                  "text-[var(--text)] backdrop-blur transition-colors",
                  "hover:border-[var(--accent)]/60 hover:bg-[var(--surface)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                )}
                /* Sin aria-label: el texto visible "Género: X" ya describe el
                   control y evita el mismatch contenido visible ↔ nombre accesible. */
              >
                <span className="text-[var(--text-muted)]">{t("filterGenre")}:</span>
                <span>{currentGenreLabel}</span>
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[60vh] overflow-y-auto">
              <DropdownMenuLabel>{t("filterGenre")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={current.genero ?? ""}
                onValueChange={(v) => setParam("genero", v === "" ? null : v)}
              >
                <DropdownMenuRadioItem value="">
                  {t("filterAllGenres")}
                </DropdownMenuRadioItem>
                {genres.map((g) => (
                  <DropdownMenuRadioItem key={g} value={slugifyGenre(g)}>
                    {g}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Contador + clear */}
          <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
            {resultsLabel}
          </span>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              aria-label={t("filtersClear")}
            >
              <X className="size-4" />
              {t("filtersClear")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatusPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function StatusPill({ label, active, onClick }: StatusPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={active}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-11 shrink-0 cursor-pointer items-center rounded-[var(--radius-pill)]",
        "border px-4 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        active
          ? "border-transparent bg-[var(--accent-deep)] text-white shadow-[var(--shadow-glow)]"
          : "border-[var(--border)] bg-[var(--surface)]/60 text-[var(--text-muted)] hover:border-[var(--accent)]/60 hover:text-[var(--text)]",
      )}
    >
      {label}
    </button>
  );
}
