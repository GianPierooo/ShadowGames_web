import { describe, expect, it } from "vitest";
import type { Jam } from "../../types";
import {
  CLOSING_SOON_DAYS,
  categorize,
  colorForJam,
  reasonLabel,
  resolveChannel,
} from "../categorize";

// NOW fijo para que las ventanas temporales (cierra pronto) sean deterministas.
const NOW = Date.parse("2026-07-10T00:00:00.000Z");
const DAY = 86_400_000;

/** Fábrica de Jam con defaults neutros; sólo se pasan los campos relevantes. */
function jam(overrides: Partial<Jam> = {}): Jam {
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
    ranked: null,
    featured: false,
    enrichmentConfidence: 0.3,
    ...overrides,
  };
}

const keys = (j: Jam) => categorize(j, NOW).map((c) => c.key);

describe("categorize · premio en efectivo", () => {
  it("dispara con prizeValueUsd > 0", () => {
    expect(keys(jam({ prizeValueUsd: 5000, hasPrize: true }))).toContain("premio");
  });
  it("NO dispara con premio en especie (valor null) ni con 0", () => {
    expect(keys(jam({ hasPrize: true, prizeValueUsd: null }))).not.toContain("premio");
    expect(keys(jam({ prizeValueUsd: 0 }))).not.toContain("premio");
  });
});

describe("categorize · español", () => {
  it("dispara cuando languages incluye 'es'", () => {
    expect(keys(jam({ languages: ["es", "en"] }))).toContain("es");
  });
  it("NO dispara sin 'es'", () => {
    expect(keys(jam({ languages: ["en"] }))).not.toContain("es");
  });
});

describe("categorize · relámpago (≤48h)", () => {
  it("dispara con durationDays ≤ 2", () => {
    expect(keys(jam({ durationDays: 2 }))).toContain("relampago");
    expect(keys(jam({ durationDays: 1 }))).toContain("relampago");
  });
  it("NO dispara con durationDays > 2", () => {
    expect(keys(jam({ durationDays: 3 }))).not.toContain("relampago");
  });
  it("deriva la duración de start/end si falta durationDays", () => {
    const start = "2026-07-11T00:00:00.000Z";
    const endShort = "2026-07-12T12:00:00.000Z"; // 36h
    const endLong = "2026-07-20T00:00:00.000Z"; // 9 días
    expect(keys(jam({ startAt: start, endAt: endShort }))).toContain("relampago");
    expect(keys(jam({ startAt: start, endAt: endLong }))).not.toContain("relampago");
  });
});

describe("categorize · cierra pronto (≤3 días)", () => {
  it("dispara si el deadline cae dentro de la ventana", () => {
    const soon = new Date(NOW + 2 * DAY).toISOString();
    expect(keys(jam({ endAt: soon }))).toContain("cierra");
  });
  it("NO dispara si el deadline está más allá de la ventana", () => {
    const later = new Date(NOW + (CLOSING_SOON_DAYS + 2) * DAY).toISOString();
    expect(keys(jam({ endAt: later }))).not.toContain("cierra");
  });
  it("NO dispara si ya cerró, ni si no hay deadline", () => {
    const past = new Date(NOW - DAY).toISOString();
    expect(keys(jam({ endAt: past }))).not.toContain("cierra");
    expect(keys(jam({ endAt: null }))).not.toContain("cierra");
  });
});

describe("categorize · múltiples categorías", () => {
  it("una jam puede caer en varias, en orden de prioridad", () => {
    const soon = new Date(NOW + DAY).toISOString();
    const j = jam({
      prizeValueUsd: 1000,
      hasPrize: true,
      languages: ["es"],
      durationDays: 1,
      endAt: soon,
    });
    expect(keys(j)).toEqual(["premio", "es", "relampago", "cierra"]);
  });
});

describe("colorForJam", () => {
  it("brasa si premio, violeta si convocatoria o español, neutro si nada", () => {
    const premio = jam({ prizeValueUsd: 100 });
    const conv = jam({ source: "cultura-pe", languages: ["es"] });
    const es = jam({ languages: ["es"] });
    const nada = jam();
    expect(colorForJam(premio, categorize(premio, NOW))).toBe(0xe7a95c);
    expect(colorForJam(conv, categorize(conv, NOW))).toBe(0xa78bfa);
    expect(colorForJam(es, categorize(es, NOW))).toBe(0xa78bfa);
    expect(colorForJam(nada, categorize(nada, NOW))).toBe(0x8d889b);
  });
});

describe("reasonLabel", () => {
  it("une las etiquetas con ' · '", () => {
    const j = jam({ prizeValueUsd: 100, languages: ["es"] });
    expect(reasonLabel(categorize(j, NOW))).toBe("💰 Premio en efectivo · 🇪🇸 Español");
  });
});

describe("resolveChannel", () => {
  const soon = new Date(NOW + DAY).toISOString();
  const multi = jam({ prizeValueUsd: 100, languages: ["es"], endAt: soon });

  it("sin webhooks específicos → general", () => {
    const ch = resolveChannel(categorize(multi, NOW), () => false);
    expect(ch.key).toBe("general");
    expect(ch.webhookEnv).toBeNull();
  });
  it("enruta a la categoría de MAYOR prioridad que tenga webhook", () => {
    // sólo el de español configurado → aunque haya premio, va a 'es'
    const onlyEs = resolveChannel(
      categorize(multi, NOW),
      (n) => n === "DISCORD_WEBHOOK_ES",
    );
    expect(onlyEs.key).toBe("es");
    // premio y español configurados → gana premio (prioridad 1)
    const both = resolveChannel(
      categorize(multi, NOW),
      (n) => n === "DISCORD_WEBHOOK_ES" || n === "DISCORD_WEBHOOK_PREMIO",
    );
    expect(both.key).toBe("premio");
    expect(both.webhookEnv).toBe("DISCORD_WEBHOOK_PREMIO");
  });
});
