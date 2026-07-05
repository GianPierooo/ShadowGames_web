import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { extractItchDetailText } from "../itch-detail";
import { enrichHeuristics } from "../../enrich";
import type { Jam } from "../../types";

/**
 * Blinda el extractor de detalle de itch (itch-detail.ts) + las heurísticas de
 * enriquecimiento (enrich.ts, fases 4-5): premio efectivo/especie, política de IA
 * con negaciones, motor y solo/equipo. Fixture: itch-detail.html (Bezi Mega Jam).
 */
const fx = (name: string): string =>
  readFileSync(new URL(`../__fixtures__/${name}`, import.meta.url), "utf8");

function baseJam(over: Partial<Jam> = {}): Jam {
  return {
    source: "itch",
    sourceId: "x",
    url: "https://itch.io/jam/x",
    title: "Test Jam",
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
    enrichmentConfidence: 0.3,
    ...over,
  };
}

describe("itch-detail · extractItchDetailText + enriquecimiento (fixture Bezi)", () => {
  const text = extractItchDetailText(fx("itch-detail.html"));

  it("extrae texto sustancial con la mención del motor", () => {
    expect(text).not.toBeNull();
    expect(text!.length).toBeGreaterThan(500);
    expect(text!.toLowerCase()).toContain("godot");
  });

  it("detecta premio EN EFECTIVO, IA prohibida y motor godot", () => {
    const j = enrichHeuristics(baseJam({ title: "Bezi Mega Jam" }), text!);
    expect(j.aiPolicy).toBe("banned");
    expect(j.hasPrize).toBe(true);
    expect(j.prizeValueUsd).toBeGreaterThan(0); // efectivo con monto
    expect(j.engine).toBe("godot");
    expect(j.enrichmentSignals).toContain("ia=banned");
    expect(j.enrichmentVersion).toBeGreaterThanOrEqual(3);
  });
});

describe("heurísticas por reglas (casos sintéticos, deterministas)", () => {
  const ai = (t: string) => enrichHeuristics(baseJam(), t).aiPolicy;

  it("IA: permitida / prohibida (prohíbe gana) / unknown sin señal", () => {
    expect(ai("AI is allowed in this jam")).toBe("allowed");
    expect(ai("AI is not allowed. Human-made only.")).toBe("banned");
    expect(ai("no generative A.I. permitted")).toBe("banned");
    expect(ai("A cozy little jam about cats")).toBe("unknown");
  });

  it("PREMIO: efectivo con monto / en especie / sin premio", () => {
    const cash = enrichHeuristics(baseJam(), "Win $5,000 in prizes!");
    expect(cash.hasPrize).toBe(true);
    expect(cash.prizeValueUsd).toBe(5000);

    const inkind = enrichHeuristics(baseJam(), "Prizes include Steam keys and asset packs.");
    expect(inkind.hasPrize).toBe(true);
    expect(inkind.prizeValueUsd).toBeNull();
    expect(inkind.prizeSummary).toMatch(/especie/i);

    expect(enrichHeuristics(baseJam(), "Just for fun, no prizes.").hasPrize).toBe(false);
  });

  it("EQUIPO: team / solo / both", () => {
    expect(enrichHeuristics(baseJam(), "Teams of up to 4 are allowed").teamPolicy).toBe("team");
    expect(enrichHeuristics(baseJam(), "Solo only, no teams here").teamPolicy).toBe("solo");
    expect(enrichHeuristics(baseJam(), "You can join solo or in a team").teamPolicy).toBe("both");
  });

  it("MOTOR: unity / ren'py / sin motor", () => {
    expect(enrichHeuristics(baseJam(), "Made with Unity").engine).toBe("unity");
    expect(enrichHeuristics(baseJam(), "A Ren'Py visual novel jam").engine).toBe("renpy");
    expect(enrichHeuristics(baseJam(), "A jam with no engine mentioned").engine).toBeNull();
  });

  it("IDIOMA: detecta español desde el detalle", () => {
    const j = enrichHeuristics(baseJam(), "Convocatoria para el desarrollo de videojuegos en español");
    expect(j.languages).toContain("es");
  });
});
