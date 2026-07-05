/**
 * Premio destacado con el acento brasa. Salta a la vista cuando existe.
 * Divide `summary` en "importe" (primer segmento) + detalle (resto) usando " · ".
 * Presentacional: recibe el string ya formateado.
 */
export function PrizeTag({ summary }: { summary: string }) {
  const [amount, ...rest] = summary.split(" · ");
  const detail = rest.join(" · ");
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-ember/35 bg-ember/[0.09] px-3.5 py-3">
      <span className="font-display text-lg font-bold tracking-[-0.01em] text-ember">
        {amount}
      </span>
      {detail && <span className="text-xs text-ember-ink">{detail}</span>}
    </div>
  );
}
