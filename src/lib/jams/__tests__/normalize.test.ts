import { describe, it, expect } from "vitest";
import { dedupe, sanitize } from "../normalize";
import type { Jam } from "../types";

/**
 * Blinda el dedupe cruzado (que FUSIONA campos entre fuentes) y el sanitize
 * (descarta cerradas / fechas absurdas). Casos borde: multi-fuente, fechas null.
 */
const base: Jam = {
  source: "itch",
  sourceId: "",
  url: "https://itch.io/jam/x",
  title: "",
  hosts: [],
  startAt: null,
  endAt: null,
  durationDays: null,
  theme: null,
  tags: [],
  languages: [],
  hasPrize: null,
  prizeSummary: null,
  prizeValueUsd: null,
  aiPolicy: "unknown",
  mode: "online",
  participants: null,
  country: null,
  ranked: false,
  featured: false,
  enrichmentConfidence: 0.5,
};
const J = (o: Partial<Jam>): Jam => ({ ...base, ...o });

describe("dedupe cruzado (fusiona por título normalizado + fechas cercanas)", () => {
  it("misma jam en itch y en un agregador → 1 jam fusionada", () => {
    const itch = J({
      source: "itch",
      sourceId: "cool-jam",
      title: "Cool Jam 2026",
      startAt: "2026-08-01T00:00:00.000Z",
      endAt: "2026-08-08T00:00:00.000Z",
      engine: "godot",
      hasPrize: null,
      aiPolicy: "unknown",
      enrichmentConfidence: 0.8,
    });
    const agg = J({
      source: "alakajam",
      sourceId: "cool-jam-akj",
      title: "Cool Jam 2026!", // mismo título normalizado
      endAt: "2026-08-08T12:00:00.000Z", // < 4 días → cercana
      hasPrize: true,
      prizeValueUsd: 1000,
      aiPolicy: "banned",
      enrichmentConfidence: 0.55,
    });
    const out = dedupe([itch, agg]);
    expect(out).toHaveLength(1);
    const m = out[0]!;
    // base = itch (mayor confianza) → conserva fechas y motor
    expect(m.engine).toBe("godot");
    expect(m.startAt).toBe("2026-08-01T00:00:00.000Z");
    // rellena huecos con el agregador (premio, IA)
    expect(m.hasPrize).toBe(true);
    expect(m.prizeValueUsd).toBe(1000);
    expect(m.aiPolicy).toBe("banned");
    expect(m.enrichmentConfidence).toBe(0.8); // el máximo
  });

  it("títulos distintos → NO se fusionan", () => {
    const a = J({ sourceId: "a", title: "Horror Jam", endAt: "2026-08-01T00:00:00.000Z" });
    const b = J({ sourceId: "b", title: "Puzzle Jam", endAt: "2026-08-01T00:00:00.000Z" });
    expect(dedupe([a, b])).toHaveLength(2);
  });

  it("mismo (source, sourceId) → 1 (nivel 1), conserva la de mayor confianza", () => {
    const lo = J({ sourceId: "z", title: "Z", enrichmentConfidence: 0.3, hasPrize: null });
    const hi = J({ sourceId: "z", title: "Z", enrichmentConfidence: 0.9, hasPrize: true });
    const out = dedupe([lo, hi]);
    expect(out).toHaveLength(1);
    expect(out[0]!.hasPrize).toBe(true);
  });
});

describe("sanitize", () => {
  const NOW = new Date("2026-07-10T00:00:00.000Z");
  it("descarta jams cerradas (>1 día pasado el deadline) y newsletters", () => {
    const open = J({ sourceId: "open", title: "Open", endAt: "2026-07-20T00:00:00.000Z" });
    const closed = J({ sourceId: "closed", title: "Closed", endAt: "2026-07-01T00:00:00.000Z" });
    const noDate = J({ sourceId: "nodate", title: "Sin fecha", endAt: null });
    const news = J({ sourceId: "news", title: "Weekly newsletter", endAt: "2026-07-20T00:00:00.000Z" });
    const out = sanitize([open, closed, noDate, news], NOW).map((j) => j.sourceId).sort();
    expect(out).toEqual(["nodate", "open"]); // cerrada y newsletter fuera; sin-fecha se conserva
  });
});
