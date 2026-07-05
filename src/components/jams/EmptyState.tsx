import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Estado vacío: sin jams que coincidan con los filtros. */
export async function EmptyState() {
  const t = await getTranslations("jams.empty");
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-edge bg-radar-surface/40 px-10 py-16 text-center">
      <RadarIcon />
      <h3 className="font-display text-[22px] font-semibold text-radar-text">
        {t("title")}
      </h3>
      <p className="max-w-[320px] text-sm leading-relaxed text-muted">
        {t("body")}
      </p>
      <Link
        href="/jams"
        className="inline-flex min-h-11 items-center rounded-xl border border-ember/50 bg-ember/15 px-5 text-sm font-semibold text-ember transition-colors hover:bg-ember/25"
      >
        {t("action")}
      </Link>
    </div>
  );
}

function RadarIcon() {
  return (
    <div className="relative grid size-[88px] place-items-center rounded-full border border-edge">
      <span className="size-[52px] rounded-full border border-edge" />
      <span className="absolute size-[22px] rounded-full border border-edge-strong" />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-px w-10 origin-left -rotate-[38deg] bg-[linear-gradient(90deg,var(--ember),transparent)]"
      />
    </div>
  );
}
