import { describe, it, expect } from "vitest";
import { applyJamFilters, parseJamFilters } from "../filters";
import type { Jam } from "../types";

/**
 * Blinda applyJamFilters + parseJamFilters: que cada param de la URL
 * (premio/efectivo/idioma/ia/fuente/motor/equipo/ranked/cierra/duracion) filtre
 * con la misma semántica que el SQL de queryJams. Casos borde: fechas null, unknown.
 */
const NOW = new Date("2026-07-10T00:00:00.000Z");

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
const J = (o: Partial<Jam>): Jam => ({ ...base, ...o, sourceId: o.sourceId ?? o.title ?? "" });

const DATA: Jam[] = [
  J({ title: "a", hasPrize: true, prizeValueUsd: 5000, languages: ["en"], aiPolicy: "banned", engine: "godot", teamPolicy: "solo", ranked: true, endAt: "2026-07-12T00:00:00.000Z", durationDays: 2 }),
  J({ title: "b", source: "devpost", hasPrize: true, prizeValueUsd: null, languages: ["es"], aiPolicy: "allowed", engine: "unity", teamPolicy: "team", ranked: false, endAt: "2026-07-30T00:00:00.000Z", durationDays: 5 }),
  J({ title: "c", hasPrize: false, languages: ["en"], aiPolicy: "unknown", engine: null, teamPolicy: null, ranked: true, endAt: null, durationDays: null }),
  J({ title: "d", hasPrize: true, prizeValueUsd: 100, languages: ["es", "en"], aiPolicy: "banned", engine: "godot", teamPolicy: "both", ranked: true, endAt: "2026-09-01T00:00:00.000Z", durationDays: 20 }),
];

/** Aplica los filtros de `sp` y devuelve los ids ORDENADOS (comparación estable). */
const ids = (sp: Record<string, string>): string[] =>
  applyJamFilters(DATA, parseJamFilters(sp), NOW)
    .map((j) => j.sourceId)
    .sort();

describe("applyJamFilters", () => {
  it("premio / efectivo", () => {
    expect(ids({ premio: "1" })).toEqual(["a", "b", "d"]);
    expect(ids({ efectivo: "1" })).toEqual(["a", "d"]);
  });
  it("idioma / ia (unknown NO cuenta)", () => {
    expect(ids({ idioma: "es" })).toEqual(["b", "d"]);
    expect(ids({ ia: "banned" })).toEqual(["a", "d"]);
    expect(ids({ ia: "allowed" })).toEqual(["b"]);
  });
  it("fuente multi (IN)", () => {
    expect(ids({ fuente: "devpost" })).toEqual(["b"]);
    expect(ids({ fuente: "itch,devpost" })).toEqual(["a", "b", "c", "d"]);
  });
  it("motor multi (IN)", () => {
    expect(ids({ motor: "godot" })).toEqual(["a", "d"]);
    expect(ids({ motor: "godot,unity" })).toEqual(["a", "b", "d"]);
    expect(ids({ motor: "bitsy" })).toEqual([]); // sin datos → vacío
  });
  it("equipo / ranked", () => {
    expect(ids({ equipo: "solo" })).toEqual(["a"]);
    expect(ids({ equipo: "both" })).toEqual(["d"]);
    expect(ids({ ranked: "1" })).toEqual(["a", "c", "d"]);
  });
  it("cierra (ventana de deadline; null no cierra) / duracion (null fuera)", () => {
    expect(ids({ cierra: "semana" })).toEqual(["a"]); // ≤ 2026-07-17
    expect(ids({ cierra: "mes" })).toEqual(["a", "b"]); // ≤ 2026-08-09
    expect(ids({ duracion: "relampago" })).toEqual(["a"]);
    expect(ids({ duracion: "corta" })).toEqual(["b"]);
    expect(ids({ duracion: "larga" })).toEqual(["d"]);
  });
  it("combinaciones e imposible→vacío", () => {
    expect(ids({ premio: "1", ia: "banned", motor: "godot" })).toEqual(["a", "d"]);
    expect(ids({ motor: "unity", equipo: "solo" })).toEqual([]);
  });
  it("sin filtros → todas", () => {
    expect(ids({})).toEqual(["a", "b", "c", "d"]);
  });
});
