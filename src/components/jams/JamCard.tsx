import { getFormatter, getTranslations } from "next-intl/server";
import type { Jam } from "@/lib/jams/types";
import { getDeadlineInfo } from "@/lib/jams/format";
import { cn } from "@/lib/cn";
import { SourceBadge } from "./SourceBadge";
import { AiChip } from "./AiChip";
import { PrizeTag } from "./PrizeTag";

/** Variante visual de la tarjeta según destaque / financiación. */
function variantClasses(jam: Jam): string {
  if (jam.featured) {
    return "border-ember/40 bg-[linear-gradient(180deg,var(--rj-surface-2),var(--rj-surface)_62%)] shadow-[0_26px_50px_-30px_rgba(231,169,92,0.30)]";
  }
  if (jam.source === "cultura-pe" || jam.source === "cva-pe") {
    // Convocatoria (LatAm) → tratamiento violeta.
    return "border-violet/40 bg-[linear-gradient(180deg,var(--rj-surface-2),var(--rj-surface)_60%)]";
  }
  return "border-edge bg-radar-surface";
}

export async function JamCard({ jam, now }: { jam: Jam; now: Date }) {
  const t = await getTranslations("jams");
  const format = await getFormatter();
  const deadline = getDeadlineInfo(jam, now);

  // --- Cuenta regresiva (el deadline debe saltar a la vista) ---
  let countdownText: string | null = null;
  let countdownTone: "ember" | "danger" | "faint" = "ember";

  if (!jam.startAt && jam.endAt) {
    // Sólo deadline: mostramos la fecha límite directamente.
    countdownText = t("card.deadlineOn", {
      date: format.dateTime(new Date(jam.endAt), {
        day: "numeric",
        month: "short",
      }),
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

  // --- Línea de fechas ---
  const modeLabel = jam.mode !== "unknown" ? t(`mode.${jam.mode}`) : null;
  let dateLine: string;
  if (jam.startAt && jam.endAt) {
    const range = format.dateTimeRange(
      new Date(jam.startAt),
      new Date(jam.endAt),
      { day: "numeric", month: "short", year: "numeric" },
    );
    dateLine = [
      range,
      modeLabel,
      jam.country && jam.mode !== "online" ? jam.country : null,
    ]
      .filter(Boolean)
      .join(" · ");
  } else if (jam.endAt) {
    dateLine = `${t("card.onlyDeadline")} · ${t("card.noStart")}`;
  } else {
    dateLine = t("card.datesTbd");
  }

  // --- Meta: idiomas · participantes · host ---
  const langs = jam.languages.map((c) => t(`language.${c}`)).join(" · ");
  const metaParts = [
    langs || null,
    jam.participants != null
      ? t("card.participants", { count: jam.participants })
      : null,
    jam.hosts.length
      ? t("card.by", { name: jam.hosts.map((h) => h.name).join(", ") })
      : null,
  ].filter(Boolean);

  const toneClass =
    countdownTone === "danger"
      ? "text-danger"
      : countdownTone === "faint"
        ? "text-faint"
        : "text-ember";

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors",
        variantClasses(jam),
      )}
    >
      {(jam.source === "cultura-pe" || jam.source === "cva-pe") && (
        <p className="-mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-violet-softer">
          {t("card.fundedEyebrow")}
        </p>
      )}

      {/* fila superior: fuente + política de IA.
          El chip de IA sólo informa cuando permite/prohíbe; con "unknown" (la
          mayoría) no aporta y añade ruido, así que se omite. */}
      <div className="flex items-center justify-between gap-2.5">
        <SourceBadge source={jam.source} />
        {jam.aiPolicy !== "unknown" && (
          <AiChip policy={jam.aiPolicy} label={t(`ai.${jam.aiPolicy}`)} />
        )}
      </div>

      <h3 className="font-display text-[21px] font-semibold leading-[1.16] tracking-[-0.01em] text-radar-text text-pretty">
        {jam.title}
      </h3>

      {/* cuenta regresiva + fechas */}
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {deadline?.ongoing && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/45 bg-violet/16 px-2 py-0.5 text-[11px] font-semibold text-violet-soft">
              <span className="size-1.5 animate-pulse rounded-full bg-violet" />
              {t("card.ongoing")}
            </span>
          )}
          {countdownText && (
            <span className="inline-flex items-center gap-2">
              <ClockIcon className={toneClass} />
              <span
                className={cn(
                  "font-display text-[16.5px] font-bold tracking-[-0.01em]",
                  toneClass,
                )}
              >
                {countdownText}
              </span>
            </span>
          )}
        </div>
        <span className="pl-[22px] text-[12.5px] text-muted">{dateLine}</span>
      </div>

      {/* premio destacado */}
      {jam.hasPrize && jam.prizeSummary && <PrizeTag summary={jam.prizeSummary} />}

      {/* meta */}
      {metaParts.length > 0 && (
        <p className="text-[12.5px] leading-relaxed text-muted">
          {metaParts.join("   ·   ")}
        </p>
      )}

      {/* tema + tags */}
      {(jam.theme || jam.tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {jam.theme && (
            <span className="rounded-md border border-ember/25 bg-ember/[0.07] px-2.5 py-1 text-[11.5px] text-ember-ink">
              {t("card.themeLabel", { theme: jam.theme })}
            </span>
          )}
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

      {/* CTA */}
      <a
        href={jam.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-edge bg-radar-surface-2 text-[13.5px] font-semibold text-ember transition-colors hover:border-edge-strong hover:bg-radar-surface"
      >
        {t("card.viewSource")}
        <span aria-hidden>↗</span>
      </a>
    </article>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("flex-none", className)}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
