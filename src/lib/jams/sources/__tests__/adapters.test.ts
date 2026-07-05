import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseItchList } from "../itch";
import { parseDevpostJson } from "../devpost";
import { parseCulturaPe } from "../cultura-pe";
import { parseGlobalGameJam } from "../globalgamejam";
import { parseAlakajamEvents } from "../alakajam";

/**
 * Tests OFFLINE sobre fixtures capturados en __fixtures__/. Blindan el PARSEO de
 * cada fuente: si una fuente cambia su HTML/JSON, estos tests fallan (en vez de
 * que el radar deje de traer jams en silencio). Re-capturar fixtures: ver
 * __fixtures__/README.md.
 */
const fx = (name: string): string =>
  readFileSync(new URL(`../__fixtures__/${name}`, import.meta.url), "utf8");

describe("itch · parseItchList (fixture itch-upcoming.html)", () => {
  const jams = parseItchList(fx("itch-upcoming.html"), "upcoming");

  it("extrae varias jams con los campos base bien formados", () => {
    expect(jams.length).toBeGreaterThanOrEqual(10);
    for (const j of jams) {
      expect(j.source).toBe("itch");
      expect(j.title.length).toBeGreaterThan(0);
      expect(j.url).toMatch(/^https:\/\/itch\.io\/jam\//);
      expect(j.sourceId.length).toBeGreaterThan(0);
    }
    expect(jams.some((j) => j.endAt !== null)).toBe(true); // al menos una con deadline
  });

  it("parsea una jam conocida del fixture (GMTK Game Jam 2026)", () => {
    const gmtk = jams.find((j) => j.sourceId === "gmtk-jam-2026");
    expect(gmtk).toBeDefined();
    expect(gmtk!.title).toContain("GMTK Game Jam 2026");
    expect(gmtk!.endAt).toBe("2026-07-26T17:00:00.000Z");
    expect(gmtk!.durationDays).toBe(4);
    expect(gmtk!.participants).toBe(22000);
  });
});

describe("devpost · parseDevpostJson (fixture devpost.json)", () => {
  const jams = parseDevpostJson(JSON.parse(fx("devpost.json")));

  it("filtra a gamedev y mapea premio/fechas de una hackathon conocida", () => {
    expect(jams.length).toBeGreaterThanOrEqual(1);
    const reddit = jams.find((j) => /games with a hook/i.test(j.title));
    expect(reddit).toBeDefined();
    expect(reddit!.source).toBe("devpost");
    expect(reddit!.prizeValueUsd).toBe(40000);
    expect(reddit!.endAt).toBe("2026-07-15T23:59:00.000Z");
  });
});

describe("cultura-pe · parseCulturaPe (fixture cultura-pe.html)", () => {
  // now fijo (ene 2026) para que el concurso 2026 cuente como abierto.
  const jams = parseCulturaPe(fx("cultura-pe.html"), Date.UTC(2026, 0, 1));

  it("extrae el concurso de videojuegos abierto, en español, Perú", () => {
    expect(jams.length).toBeGreaterThanOrEqual(1);
    const j = jams[0]!;
    expect(j.source).toBe("cultura-pe");
    expect(j.languages).toContain("es");
    expect(j.country).toBe("PE");
    expect(j.hasPrize).toBe(true);
    expect(j.endAt).toBe("2026-08-01T04:59:00.000Z");
  });
});

describe("globalgamejam · parseGlobalGameJam (fixture globalgamejam.html)", () => {
  it("extrae las fechas de la próxima edición de la home", () => {
    const jams = parseGlobalGameJam(fx("globalgamejam.html"), Date.UTC(2026, 6, 1));
    expect(jams).toHaveLength(1);
    expect(jams[0]!.title).toBe("Global Game Jam 2027");
    expect(jams[0]!.startAt).toBe("2027-01-25T00:00:00.000Z");
    expect(jams[0]!.endAt).toBe("2027-01-31T23:59:00.000Z");
    expect(jams[0]!.mode).toBe("hybrid");
  });
});

describe("alakajam · parseAlakajamEvents (fixture alakajam.json)", () => {
  it("del fixture real (todas cerradas/TBC) → sin edición vigente", () => {
    const jams = parseAlakajamEvents(JSON.parse(fx("alakajam.json")), Date.UTC(2026, 6, 1));
    expect(jams).toHaveLength(0);
  });

  it("mapea un evento ABIERTO con fechas parseables (sintético)", () => {
    const events = [
      {
        id: 99,
        name: "99th-alakajam",
        title: "99th Alakajam!",
        display_dates: "14-16 November 2030",
        status: "open",
        url: "https://alakajam.com/99th-alakajam",
      },
    ];
    const jams = parseAlakajamEvents(events, Date.UTC(2030, 10, 1));
    expect(jams).toHaveLength(1);
    expect(jams[0]!.source).toBe("alakajam");
    expect(jams[0]!.title).toBe("99th Alakajam!");
    expect(jams[0]!.startAt).toBe("2030-11-14T00:00:00.000Z");
    expect(jams[0]!.endAt).toBe("2030-11-16T23:59:00.000Z");
    expect(jams[0]!.ranked).toBe(true);
  });
});
