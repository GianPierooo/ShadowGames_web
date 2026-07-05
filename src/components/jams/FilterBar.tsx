"use client";

import { type ChangeEvent, useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AI_OPTIONS,
  LANGUAGE_OPTIONS,
  MODE_OPTIONS,
  SORT_OPTIONS,
  countActiveFilters,
  parseJamFilters,
} from "@/lib/jams/filters";
import { SOURCE_META, SOURCE_ORDER } from "@/lib/jams/labels";
import { Input } from "@/components/jams/ui/Input";
import { Select } from "@/components/jams/ui/Select";
import { Chip, type ChipTone } from "@/components/jams/ui/Chip";
import { Button } from "@/components/jams/ui/Button";

/**
 * Barra de filtros sticky. Es la única que ESCRIBE los search params
 * (la página los lee y filtra en el servidor). Nombres de params: ver page.tsx.
 */
export function FilterBar() {
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

  const langOptions = LANGUAGE_OPTIONS.map((c) => ({
    value: c,
    label: t(`language.${c}`),
  }));
  const aiOptions = AI_OPTIONS.map((v) => ({ value: v, label: t(`ai.${v}`) }));
  const modeOptions = MODE_OPTIONS.map((v) => ({
    value: v,
    label: t(`mode.${v}`),
  }));
  const sourceOptions = SOURCE_ORDER.map((s) => ({
    value: s,
    label: SOURCE_META[s].label,
  }));
  const sortOptions = SORT_OPTIONS.map((v) => ({
    value: v,
    label: t(`sort.${v}`),
  }));

  const onSelect =
    (key: string) => (e: ChangeEvent<HTMLSelectElement>) =>
      setParam(key, e.target.value);

  // --- Chips de filtros activos (derivados de los filtros validados) ---
  const activeChips: { key: string; label: string; tone: ChipTone; onRemove: () => void }[] = [];
  if (filters.premio)
    activeChips.push({
      key: "premio",
      label: t("filters.prize"),
      tone: "ember",
      onRemove: () => setParam("premio", ""),
    });
  if (filters.idioma)
    activeChips.push({
      key: "idioma",
      label: t(`language.${filters.idioma}`),
      tone: "violet",
      onRemove: () => setParam("idioma", ""),
    });
  if (filters.ia)
    activeChips.push({
      key: "ia",
      label: t(`ai.${filters.ia}`),
      tone: filters.ia === "banned" ? "danger" : "violet",
      onRemove: () => setParam("ia", ""),
    });
  if (filters.modalidad)
    activeChips.push({
      key: "modalidad",
      label: t(`mode.${filters.modalidad}`),
      tone: "neutral",
      onRemove: () => setParam("modalidad", ""),
    });
  if (filters.fuente)
    activeChips.push({
      key: "fuente",
      label: SOURCE_META[filters.fuente].label,
      tone: "neutral",
      onRemove: () => setParam("fuente", ""),
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
      {/* fila 1: buscador · orden · limpiar */}
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

      {/* fila 2: controles de filtro */}
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
          aria-label={t("filters.ai")}
          placeholder={t("filters.ai")}
          options={aiOptions}
          value={filters.ia ?? ""}
          onChange={onSelect("ia")}
        />
        <Select
          aria-label={t("filters.mode")}
          placeholder={t("filters.mode")}
          options={modeOptions}
          value={filters.modalidad ?? ""}
          onChange={onSelect("modalidad")}
        />
        <Select
          aria-label={t("filters.source")}
          placeholder={t("filters.source")}
          options={sourceOptions}
          value={filters.fuente ?? ""}
          onChange={onSelect("fuente")}
        />
      </div>

      {/* fila 3: chips de filtros activos */}
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
