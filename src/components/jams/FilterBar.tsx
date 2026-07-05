"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { JamSource } from "@/lib/jams/types";
import {
  DEADLINE_OPTIONS,
  DURATION_OPTIONS,
  LANGUAGE_BAR_OPTIONS,
  SORT_OPTIONS,
  TEAM_OPTIONS,
  countActiveFilters,
  parseJamFilters,
} from "@/lib/jams/filters";
import { ENGINE_LABEL, SOURCE_META } from "@/lib/jams/labels";
import { cn } from "@/lib/cn";
import { Input } from "@/components/jams/ui/Input";
import { Select } from "@/components/jams/ui/Select";
import { Chip, type ChipTone } from "@/components/jams/ui/Chip";
import { Button } from "@/components/jams/ui/Button";

/**
 * Barra de filtros sticky. Es la única que ESCRIBE los search params
 * (la página los lee y filtra en el servidor). Nombres de params: ver filters.ts.
 *
 * Jerarquía en DOS niveles (sólo presentación; los filtros y sus params no cambian):
 *  - Nivel 1 (barra principal, siempre visible): buscar · premio · idioma · cierra ·
 *    orden · FUENTE (un solo control multi-selección en popover, escribe ?fuente=…).
 *  - Nivel 2 (panel "Más filtros" plegable, agrupado): Formato (motor · duración) ·
 *    Requisitos (participación · IA · ranking) · Premio (sólo efectivo).
 *  - Pie: chips de filtros activos (con × para cada uno) · limpiar · export iCal/CSV.
 *
 * `availableSources`: fuentes ofrecidas en el popover. `availableEngines`: motores
 * presentes en los datos (no listamos chips de motor vacíos).
 */
export function FilterBar({
  availableSources,
  availableEngines,
}: {
  availableSources: JamSource[];
  availableEngines: string[];
}) {
  const t = useTranslations("jams");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const filters = parseJamFilters(Object.fromEntries(searchParams.entries()));

  const commit = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      startTransition(() =>
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
      );
    },
    [pathname, router],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      commit(params);
    },
    [searchParams, commit],
  );

  const clearAll = useCallback(() => commit(new URLSearchParams()), [commit]);

  const toggleSource = (src: JamSource) => {
    const next = filters.fuentes.includes(src)
      ? filters.fuentes.filter((s) => s !== src)
      : [...filters.fuentes, src];
    setParam("fuente", next.join(","));
  };

  const toggleEngine = (eng: string) => {
    const next = filters.motores.includes(eng)
      ? filters.motores.filter((e) => e !== eng)
      : [...filters.motores, eng];
    setParam("motor", next.join(","));
  };

  // --- Buscador con debounce, sincronizado con la URL ---
  const qParam = filters.q;
  const [q, setQ] = useState(qParam);
  useEffect(() => setQ(qParam), [qParam]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (q.trim() !== qParam) setParam("q", q.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [q, qParam, setParam]);

  // --- Panel "Más filtros" (motor · duración · participación · IA · ranking · efectivo) ---
  const advancedActive =
    (filters.efectivo ? 1 : 0) +
    (filters.ia ? 1 : 0) +
    (filters.duracion ? 1 : 0) +
    (filters.equipo ? 1 : 0) +
    (filters.ranked ? 1 : 0) +
    filters.motores.length;
  const [advancedOpen, setAdvancedOpen] = useState(advancedActive > 0);

  const onSelect =
    (key: string) => (e: ChangeEvent<HTMLSelectElement>) =>
      setParam(key, e.target.value);

  const langOptions = LANGUAGE_BAR_OPTIONS.map((c) => ({
    value: c,
    label: t(`language.${c}`),
  }));
  const sortOptions = SORT_OPTIONS.map((v) => ({
    value: v,
    label: t(`sort.${v}`),
  }));
  // "todas" es el valor por defecto (placeholder = sin param).
  const cierraOptions = DEADLINE_OPTIONS.filter((v) => v !== "todas").map((v) => ({
    value: v,
    label: t(`cierra.${v}`),
  }));
  const duracionOptions = DURATION_OPTIONS.map((v) => ({
    value: v,
    label: t(`duracion.${v}`),
  }));
  const teamOptions = TEAM_OPTIONS.map((v) => ({
    value: v,
    label: t(`equipo.${v}`),
  }));

  // --- Chips de filtros activos (derivados de los filtros validados) ---
  const activeChips: {
    key: string;
    label: string;
    tone: ChipTone;
    onRemove: () => void;
  }[] = [];
  if (filters.premio)
    activeChips.push({
      key: "premio",
      label: t("filters.prize"),
      tone: "ember",
      onRemove: () => setParam("premio", ""),
    });
  if (filters.efectivo)
    activeChips.push({
      key: "efectivo",
      label: t("filters.cashPrize"),
      tone: "ember",
      onRemove: () => setParam("efectivo", ""),
    });
  if (filters.idioma)
    activeChips.push({
      key: "idioma",
      label: t(`language.${filters.idioma}`),
      tone: "violet",
      onRemove: () => setParam("idioma", ""),
    });
  if (filters.cierra !== "todas")
    activeChips.push({
      key: "cierra",
      label: t(`cierra.${filters.cierra}`),
      tone: "neutral",
      onRemove: () => setParam("cierra", ""),
    });
  for (const src of filters.fuentes)
    activeChips.push({
      key: `fuente-${src}`,
      label: SOURCE_META[src].label,
      tone: "neutral",
      onRemove: () => toggleSource(src),
    });
  if (filters.duracion)
    activeChips.push({
      key: "duracion",
      label: t(`duracion.${filters.duracion}`),
      tone: "neutral",
      onRemove: () => setParam("duracion", ""),
    });
  if (filters.ia)
    activeChips.push({
      key: "ia",
      label: t(`ai.${filters.ia}`),
      tone: filters.ia === "banned" ? "danger" : "violet",
      onRemove: () => setParam("ia", ""),
    });
  for (const eng of filters.motores)
    activeChips.push({
      key: `motor-${eng}`,
      label: ENGINE_LABEL[eng] ?? eng,
      tone: "violet",
      onRemove: () => toggleEngine(eng),
    });
  if (filters.equipo)
    activeChips.push({
      key: "equipo",
      label: t(`equipo.${filters.equipo}`),
      tone: "neutral",
      onRemove: () => setParam("equipo", ""),
    });
  if (filters.ranked)
    activeChips.push({
      key: "ranked",
      label: t("filters.ranked"),
      tone: "neutral",
      onRemove: () => setParam("ranked", ""),
    });
  if (filters.q)
    activeChips.push({
      key: "q",
      label: `“${filters.q}”`,
      tone: "neutral",
      onRemove: () => {
        setQ("");
        setParam("q", "");
      },
    });

  const exportQs = searchParams.toString();
  const dirty = exportQs.length > 0;
  const activeCount = countActiveFilters(filters);

  return (
    <div
      aria-busy={pending}
      className="sticky top-24 z-30 -mx-5 flex flex-col gap-3 border-y border-radar-surface-2 bg-ink/85 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8"
    >
      {/* Nivel 1 — barra principal: buscar · premio · idioma · cierra · orden · fuente · Más filtros */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[180px] flex-1">
          <SearchIcon />
          <Input
            type="search"
            aria-label={t("search.label")}
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>

        <Chip
          tone="ember"
          dot
          active={filters.premio}
          onClick={() => setParam("premio", filters.premio ? "" : "1")}
        >
          {t("filters.prize")}
        </Chip>
        <Select
          aria-label={t("filters.language")}
          placeholder={t("filters.language")}
          options={langOptions}
          value={filters.idioma ?? ""}
          onChange={onSelect("idioma")}
        />
        <Select
          aria-label={t("filters.deadline")}
          placeholder={t("cierra.todas")}
          options={cierraOptions}
          value={filters.cierra === "todas" ? "" : filters.cierra}
          onChange={onSelect("cierra")}
        />
        <Select
          aria-label={t("filters.sort")}
          options={sortOptions}
          value={filters.orden}
          onChange={(e) =>
            setParam("orden", e.target.value === "deadline" ? "" : e.target.value)
          }
        />

        <SourceFilter
          sources={availableSources}
          selected={filters.fuentes}
          onToggle={toggleSource}
          label={t("filters.source")}
          groupLabel={t("filters.sourceAll")}
          countLabel={(n) => t("filters.sourceWithCount", { count: n })}
          closeLabel={t("filters.close")}
        />

        <Button
          variant="subtle"
          className="ml-auto"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={advancedOpen}
        >
          {t("filters.more")}
          {advancedActive > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-ember/20 text-[11px] font-bold text-ember">
              {advancedActive}
            </span>
          )}
          <Chevron open={advancedOpen} />
        </Button>
      </div>

      {/* Nivel 2 — panel "Más filtros" plegable, agrupado: Formato · Requisitos · Premio */}
      {advancedOpen && (
        <div className="grid gap-x-6 gap-y-4 rounded-xl border border-edge bg-radar-surface/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterGroup label={t("filters.groupFormat")}>
            {availableEngines.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-xs text-faint">
                  {t("filters.engine")}
                </span>
                {availableEngines.map((eng) => (
                  <Chip
                    key={eng}
                    tone="violet"
                    active={filters.motores.includes(eng)}
                    onClick={() => toggleEngine(eng)}
                  >
                    {ENGINE_LABEL[eng] ?? eng}
                  </Chip>
                ))}
              </div>
            )}
            <Select
              aria-label={t("filters.duration")}
              placeholder={t("filters.duration")}
              options={duracionOptions}
              value={filters.duracion ?? ""}
              onChange={onSelect("duracion")}
              className="w-full"
            />
          </FilterGroup>

          <FilterGroup label={t("filters.groupRequirements")}>
            <Select
              aria-label={t("filters.team")}
              placeholder={t("filters.team")}
              options={teamOptions}
              value={filters.equipo ?? ""}
              onChange={onSelect("equipo")}
              className="w-full"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-full text-xs text-faint">
                {t("filters.aiHeading")}
              </span>
              <Chip
                tone="violet"
                active={filters.ia === "allowed"}
                onClick={() =>
                  setParam("ia", filters.ia === "allowed" ? "" : "allowed")
                }
              >
                {t("ai.allowed")}
              </Chip>
              <Chip
                tone="danger"
                active={filters.ia === "banned"}
                onClick={() =>
                  setParam("ia", filters.ia === "banned" ? "" : "banned")
                }
              >
                {t("ai.banned")}
              </Chip>
            </div>
            <Chip
              tone="neutral"
              dot
              active={filters.ranked}
              onClick={() => setParam("ranked", filters.ranked ? "" : "1")}
            >
              {t("filters.ranked")}
            </Chip>
          </FilterGroup>

          <FilterGroup label={t("filters.groupPrize")}>
            <Chip
              tone="ember"
              dot
              active={filters.efectivo}
              onClick={() => setParam("efectivo", filters.efectivo ? "" : "1")}
            >
              {t("filters.cashPrize")}
            </Chip>
          </FilterGroup>
        </div>
      )}

      {/* Pie: chips de filtros activos + limpiar (izq.) · export iCal/CSV (der.) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {activeCount > 0 && (
          <>
            <span className="text-xs text-faint">
              {t("filters.activeLabel")}
            </span>
            {activeChips.map((c) => (
              <Chip
                key={c.key}
                tone={c.tone}
                onRemove={c.onRemove}
                removeLabel={t("filters.remove", { label: c.label })}
              >
                {c.label}
              </Chip>
            ))}
            <Button
              variant="ghost"
              onClick={clearAll}
              className="min-h-9 px-3 text-[13px]"
            >
              {t("filters.clear")}
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-3 text-[12.5px]">
          <a
            href={`/api/jams/ical${exportQs ? `?${exportQs}` : ""}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-muted transition-colors hover:text-ember"
          >
            <DownloadIcon />
            {t("filters.exportIcal")}
          </a>
          <a
            href={`/api/jams/csv${exportQs ? `?${exportQs}` : ""}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-muted transition-colors hover:text-ember"
          >
            <DownloadIcon />
            {t("filters.exportCsv")}
          </a>
        </div>
      </div>
    </div>
  );
}

/** Bloque etiquetado del panel "Más filtros" (agrupa controles secundarios). */
function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Control único de fuente (nivel 1): botón "Fuente ▾" que abre un popover con
 * checkboxes multi-selección. Escribe el MISMO param que antes (?fuente=itch,…);
 * la semántica no cambia, sólo se colapsan 7 botones sueltos en un control.
 * Accesible: aria-expanded, checkboxes nativos (teclado), cierra con Escape o clic
 * fuera. La animación respeta prefers-reduced-motion vía globals.css.
 */
function SourceFilter({
  sources,
  selected,
  onToggle,
  label,
  groupLabel,
  countLabel,
  closeLabel,
}: {
  sources: JamSource[];
  selected: JamSource[];
  onToggle: (src: JamSource) => void;
  label: string;
  groupLabel: string;
  countLabel: (n: number) => string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (sources.length === 0) return null;

  const count = selected.length;
  const active = count > 0;

  return (
    // Mobile: control a fila completa (el popover hereda su ancho y nunca se
    // sale del viewport). Desktop: botón inline con popover de 240px.
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-radar-surface pl-3.5 pr-3 sm:w-auto sm:justify-start",
          "text-[13.5px] font-medium transition-colors hover:border-edge-strong",
          active ? "border-ember/45 text-ember" : "border-edge text-radar-text",
        )}
      >
        <span>{active ? countLabel(count) : label}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="group"
          aria-label={groupLabel}
          className="absolute left-0 top-full z-40 mt-2 max-h-[60vh] w-full overflow-auto rounded-xl border border-edge-strong bg-radar-surface-2 p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] sm:w-60"
        >
          {sources.map((src) => {
            const checked = selected.includes(src);
            return (
              <label
                key={src}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] text-radar-text transition-colors hover:bg-radar-surface"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(src)}
                  className="size-4 flex-none accent-ember"
                />
                <span
                  aria-hidden
                  className="size-2 flex-none rounded-full"
                  style={{ background: SOURCE_META[src].dot }}
                />
                <span className="font-medium">{SOURCE_META[src].label}</span>
              </label>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 flex min-h-11 w-full items-center justify-center rounded-lg border border-edge px-3 text-[13px] font-semibold text-muted transition-colors hover:border-edge-strong hover:text-radar-text"
          >
            {closeLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="flex-none"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`flex-none transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
