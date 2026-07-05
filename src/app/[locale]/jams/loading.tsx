import { getTranslations } from "next-intl/server";
import { JamCardSkeleton } from "@/components/jams/JamCardSkeleton";

/** Estado de carga: skeletons con shimmer mientras se resuelve la página. */
export default async function JamsLoading() {
  const t = await getTranslations("jams");
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("loading.label")}
      className="mx-auto w-full max-w-[1240px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[clamp(28px,5vw,40px)] font-bold leading-none tracking-[-0.02em] text-radar-text">
            {t("title")}
          </h1>
          <p className="max-w-[520px] text-[15px] leading-relaxed text-muted">
            {t("subtitle")}
          </p>
        </div>
      </header>

      {/* placeholder de la barra de filtros */}
      <div className="-mx-5 flex flex-col gap-3 border-y border-radar-surface-2 bg-ink/85 px-5 py-4 sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="skeleton h-11 flex-1 !rounded-xl" />
          <span className="skeleton h-11 w-44 !rounded-xl" />
          <span className="skeleton h-11 w-32 !rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="skeleton h-9 w-28 !rounded-full" />
          <span className="skeleton h-9 w-24 !rounded-full" />
          <span className="skeleton h-9 w-28 !rounded-full" />
          <span className="skeleton h-9 w-24 !rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
