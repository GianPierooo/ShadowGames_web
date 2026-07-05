/** Placeholder de tarjeta durante la carga (shimmer). Espeja la anatomía real. */
export function JamCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3.5 rounded-2xl border border-edge bg-radar-surface p-5">
      <div className="flex justify-between">
        <span className="skeleton h-[26px] w-20 !rounded-full" />
        <span className="skeleton h-[26px] w-24 !rounded-full" />
      </div>
      <span className="skeleton h-5 w-4/5" />
      <span className="skeleton h-4 w-3/5" />
      <span className="skeleton h-11 w-full !rounded-xl" />
      <span className="skeleton h-4 w-2/3" />
      <div className="flex gap-2">
        <span className="skeleton h-6 w-16" />
        <span className="skeleton h-6 w-20" />
        <span className="skeleton h-6 w-14" />
      </div>
      <span className="skeleton mt-auto h-11 w-full !rounded-xl" />
    </div>
  );
}
