import type { Jam } from "@/lib/jams/types";
import { JamCard } from "./JamCard";

/** Grid responsive: 1 col en móvil, 2 en tablet, 3 en desktop. */
export function JamGrid({ jams, now }: { jams: Jam[]; now: Date }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {jams.map((jam) => (
        <JamCard key={jam.sourceId} jam={jam} now={now} />
      ))}
    </div>
  );
}
