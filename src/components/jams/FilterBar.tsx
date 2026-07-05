"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
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
  countActiveFilters,
  parseJamFilters,
} from "@/lib/jams/filters";
import { SOURCE_META } from "@/lib/jams/labels";
import { Input } from "@/components/jams/ui/Input";
import { Select } from "@/components/jams/ui/Select";
import { Chip, type ChipTone } from "@/components/jams/ui/Chip";
import { Button } from "@/components/jams/ui/Button";

/**
 * Barra de filtros sticky. Es la única que ESCRIBE los search params
 * (la página los lee y filtra en el servidor). Nombres de params: ver filters.ts.
 *
 * Bar principal (siempre): premio · idioma · búsqueda · orden · fuente (multi) · cierra.
 * Panel "Más filtros" plegable: duración · premio en efectivo · política de IA.
 *
 * `availableSources`: fuentes con jams en el conjunto activo actual (evita mostrar
 * chips de fuentes que saldrían vacías).
 */
export function FilterBar({
  availableSources,
}: {
  availableSources: JamSource[];
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

  // --- Panel avanzado (duración · efectivo · IA) ---
  const advancedActive =
    (filters.efectivo ? 1 : 0) + (filters.ia ? 1 : 0) + (filters.duracion ? 1 : 0);
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
      {/* fila 1: buscador · orden · limpiar · export */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
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
        <Select
          aria-label={t("filters.sort")}
          options={sortOptions}
          value={filters.orden}
          onChange={(e) =>
            setParam("orden", e.target.value === "deadline" ? "" : e.target.value)
          }
        />
        <Button variant="subtle" onClick={clearAll} disabled={!dirty}>
          {t("filters.clear")}
        </Button>
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

      {/* fila 2: filtros principales */}
      <div className="flex flex-wrap items-center gap-2">
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

        {availableSources.length > 0 && (
          <>
            <span
              aria-hidden
              className="mx-0.5 hidden h-6 w-px bg-radar-surface-2 sm:block"
            />
            {availableSources.map((src) => (
              <Chip
                key={src}
                tone="neutral"
                active={filters.fuentes.includes(src)}
                onClick={() => toggleSource(src)}
              >
                {SOURCE_META[src].label}
              </Chip>
            ))}
          </>
        )}

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

      {/* panel avanzado plegable: duración · efectivo · IA */}
      {advancedOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-edge bg-radar-surface/40 px-3 py-3">
          <Select
            aria-label={t("filters.duration")}
            placeholder={t("filters.duration")}
            options={duracionOptions}
            value={filters.duracion ?? ""}
            onChange={onSelect("duracion")}
          />
          <Chip
            tone="ember"
            dot
            active={filters.efectivo}
            onClick={() => setParam("efectivo", filters.efectivo ? "" : "1")}
          >
            {t("filters.cashPrize")}
          </Chip>
          <span
            aria-hidden
            className="mx-0.5 hidden h-6 w-px bg-radar-surface-2 sm:block"
          />
          <span className="text-xs text-faint">{t("filters.aiHeading")}</span>
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
      )}

      {/* fila: chips de filtros activos */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-faint">{t("filters.activeLabel")}</span>
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
