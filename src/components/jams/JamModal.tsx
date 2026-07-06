"use client";

import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { Jam } from "@/lib/jams/types";
import { getDeadlineInfo } from "@/lib/jams/format";
import { ENGINE_LABEL } from "@/lib/jams/labels";
import { cn } from "@/lib/cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SourceBadge } from "./SourceBadge";
import { AiChip } from "./AiChip";
import { PrizeTag } from "./PrizeTag";

/**
 * Hace clicable una tarjeta (server-rendered, recibida como `children`) para
 * abrir un modal de detalle. NO cambia datos ni queries: reusa el mismo `Jam`.
 *
 * El enlace "Ver en la fuente" de la tarjeta sigue funcionando aparte: los clics
 * sobre <a>/<button> dentro de la tarjeta NO abren el modal (navegan normal).
 * La accesibilidad del modal (foco atrapado, Esc, clic fuera, aria-modal) la
 * aporta Radix Dialog; aquí sólo lo abrimos y lo vestimos con tokens --rj-*.
 */
export function JamCardModal({
  jam,
  children,
}: {
  jam: Jam;
  children: ReactNode;
}) {
  const t = useTranslations("jams");
  const [open, setOpen] = useState(false);

  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    // No abrir si el clic fue en un enlace/botón (p.ej. "Ver en la fuente").
    if ((e.target as HTMLElement).closest("a, button")) return;
    setOpen(true);
  };
  const onCardKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Sólo el contenedor abre con teclado (no los hijos, que tienen su acción).
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={t("detail.openLabel", { title: jam.title })}
        onClick={onCardClick}
        onKeyDown={onCardKey}
        className="h-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <JamDetail jam={jam} />
      </Dialog>
    </>
  );
}

/** Contenido del modal (sólo se monta cuando el Dialog está abierto). */
function JamDetail({ jam }: { jam: Jam }) {
  const t = useTranslations("jams");
  const format = useFormatter();
  const deadline = getDeadlineInfo(jam, new Date());

  // --- Cuenta regresiva (mismo criterio que la tarjeta) ---
  let countdownText: string | null = null;
  let countdownTone: "ember" | "danger" | "faint" = "ember";
  if (!jam.startAt && jam.endAt) {
    countdownText = t("card.deadlineOn", {
      date: format.dateTime(new Date(jam.endAt), { day: "numeric", month: "short" }),
    });
  } else if (deadline) {
    if (deadline.closed) {
      countdownText = t("card.closed");
      countdownTone = "faint";
    } else if (deadline.hours <= 48) {
      countdownText = t("card.closesInHours", {
        count: Math.max(1, Math.round(deadline.hours)),
      });
      countdownTone = deadline.urgent ? "danger" : "ember";
    } else {
      countdownText = t("card.closesInDays", { count: deadline.days });
    }
  }
  const toneClass =
    countdownTone === "danger"
      ? "text-danger"
      : countdownTone === "faint"
        ? "text-faint"
        : "text-ember";

  // --- Línea de fechas ---
  let dateLine: string;
  if (jam.startAt && jam.endAt) {
    dateLine = format.dateTimeRange(new Date(jam.startAt), new Date(jam.endAt), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } else if (jam.endAt) {
    dateLine = `${t("card.onlyDeadline")} · ${t("card.noStart")}`;
  } else {
    dateLine = t("card.datesTbd");
  }

  // --- Campos (sólo los que tienen dato) ---
  const fields: { key: string; label: string; value: ReactNode }[] = [];
  fields.push({ key: "dates", label: t("detail.dates"), value: dateLine });
  if (jam.languages.length)
    fields.push({
      key: "language",
      label: t("detail.language"),
      value: jam.languages.map((c) => t(`language.${c}`)).join(" · "),
    });
  fields.push({
    key: "ai",
    label: t("detail.ai"),
    value: t(`ai.${jam.aiPolicy}`),
  });
  if (jam.engine)
    fields.push({
      key: "engine",
      label: t("detail.engine"),
      value: ENGINE_LABEL[jam.engine] ?? jam.engine,
    });
  if (jam.teamPolicy)
    fields.push({
      key: "team",
      label: t("detail.team"),
      value: t(`equipo.${jam.teamPolicy}`),
    });
  if (jam.mode !== "unknown")
    fields.push({ key: "mode", label: t("detail.mode"), value: t(`mode.${jam.mode}`) });
  if (jam.country)
    fields.push({ key: "country", label: t("detail.country"), value: jam.country });
  if (jam.participants != null)
    fields.push({
      key: "participants",
      label: t("detail.participants"),
      value: format.number(jam.participants),
    });
  if (jam.ranked === true)
    fields.push({ key: "ranked", label: t("detail.ranked"), value: t("detail.yes") });

  return (
    <DialogContent
      hideClose
      className="flex max-h-[85dvh] flex-col gap-0 border-edge-strong bg-radar-surface p-0 sm:max-w-lg"
    >
      <DialogDescription className="sr-only">{t("detail.aria")}</DialogDescription>

      {/* cabecera */}
      <div className="flex items-start justify-between gap-3 border-b border-edge px-5 py-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge source={jam.source} />
            {jam.aiPolicy !== "unknown" && (
              <AiChip policy={jam.aiPolicy} label={t(`ai.${jam.aiPolicy}`)} />
            )}
          </div>
          <DialogTitle className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.01em] text-radar-text text-pretty">
            {jam.title}
          </DialogTitle>
        </div>
        <DialogClose
          aria-label={t("filters.close")}
          className="grid size-9 flex-none place-items-center rounded-full border border-edge bg-radar-surface-2 text-lg text-muted transition-colors hover:border-edge-strong hover:text-radar-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/70"
        >
          <span aria-hidden>×</span>
        </DialogClose>
      </div>

      {/* cuerpo desplazable */}
      <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        {/* cuenta regresiva */}
        {countdownText && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {deadline?.ongoing && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/45 bg-violet/16 px-2 py-0.5 text-[11px] font-semibold text-violet-soft">
                <span className="size-1.5 rounded-full bg-violet" />
                {t("card.ongoing")}
              </span>
            )}
            <span
              className={cn(
                "font-display text-[17px] font-bold tracking-[-0.01em]",
                toneClass,
              )}
            >
              {countdownText}
            </span>
          </div>
        )}

        {/* premio destacado */}
        {jam.hasPrize && jam.prizeSummary && <PrizeTag summary={jam.prizeSummary} />}

        {/* rejilla de atributos */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          {fields.map((f) => (
            <div key={f.key} className="flex min-w-0 flex-col gap-1">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-faint">
                {f.label}
              </dt>
              <dd className="text-[13.5px] leading-snug text-radar-text">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* tema + tags */}
        {(jam.theme || jam.tags.length > 0) && (
          <div className="flex flex-col gap-2">
            {jam.theme && (
              <div className="flex flex-col gap-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-faint">
                  {t("detail.theme")}
                </span>
                <span className="text-[13.5px] text-radar-text">{jam.theme}</span>
              </div>
            )}
            {jam.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {jam.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-violet/24 bg-violet/[0.08] px-2.5 py-1 text-[11.5px] text-violet-softer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* organiza (hosts, con enlace si lo hay) */}
        {jam.hosts.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-faint">
              {t("detail.hosts")}
            </span>
            <p className="text-[13.5px] leading-snug text-muted">
              {jam.hosts.map((h, i) => (
                <span key={`${h.name}-${i}`}>
                  {i > 0 && ", "}
                  {h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-radar-text underline decoration-edge-strong underline-offset-2 transition-colors hover:text-ember"
                    >
                      {h.name}
                    </a>
                  ) : (
                    <span className="text-radar-text">{h.name}</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      {/* pie: CTA a la fuente */}
      <div className="border-t border-edge px-5 py-4 sm:px-6">
        <a
          href={jam.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-ember/45 bg-ember/15 text-[14px] font-semibold text-ember transition-colors hover:border-ember/70 hover:bg-ember/25"
        >
          {t("card.viewSource")}
          <span aria-hidden>↗</span>
        </a>
      </div>
    </DialogContent>
  );
}
