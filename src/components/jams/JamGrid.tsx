import type { Jam } from "@/lib/jams/types";
import { JamCard } from "./JamCard";
import { JamCardModal } from "./JamModal";

/** Grid responsive: 1 col en móvil, 2 en tablet, 3 en desktop.
 *  Cada tarjeta (server) va envuelta en un modal de detalle (client). */
export function JamGrid({ jams, now }: { jams: Jam[]; now: Date }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {jams.map((jam) => (
        <JamCardModal key={jam.sourceId} jam={jam}>
          <JamCard jam={jam} now={now} />
        </JamCardModal>
      ))}
    </div>
  );
}
