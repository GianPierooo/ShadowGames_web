import type { AiPolicy, Jam } from "./types";

/**
 * Enriquecimiento por REGLAS/REGEX (sin IA). Un único `enrichHeuristics`:
 *  - Pass 1 (sin detalle): patrones sobre título/tema/tags/premio/hosts.
 *  - Pass 2 (con `detailText`): los mismos patrones sobre el texto de la página
 *    de detalle (mucho más rico → premio/IA/idioma). Sube la confianza y estampa
 *    ENRICH_VERSION para marcar la jam como ya procesada (caché).
 * Sin señal concluyente → aiPolicy "unknown" (estado honesto, no se inventa).
 *
 * ENRICH_VERSION: SÚBELA al mejorar las heurísticas. El pipeline (runDetailPass)
 * reprocesa UNA vez el detalle de las jams persistidas con versión anterior, así
 * las mejoras alcanzan a las jams ya cacheadas sin re-bajar todo cada corrida.
 */
export const ENRICH_VERSION = 3;

/** Primer fragmento que casa un patrón (para la auditoría de señales). */
function firstHit(re: RegExp, text: string): string | null {
  const m = text.match(re);
  return m ? m[0].replace(/\s+/g, " ").trim().slice(0, 40) : null;
}

// ---------------------------------------------------------------------------
// Idioma (español)
// ---------------------------------------------------------------------------
const ES_ACCENT = /[áéíóúñ¿¡]/;
const ES_KEYWORD =
  /\b(videojuego|convocatoria|beca|premio|espa[nñ]ol|narrativa|desarrollo|concurso|reglas|participa|jam\s+de|jugador|desarrollador|jurado|bases)\b/i;
const ES_STOPWORDS =
  /\b(que|para|con|los|las|una|del|por|como|pero|este|esta|muy|sobre|donde|cuando)\b/gi;

function looksSpanish(text: string): boolean {
  if (ES_ACCENT.test(text) || ES_KEYWORD.test(text)) return true;
  return (text.match(ES_STOPWORDS)?.length ?? 0) >= 4;
}

// ---------------------------------------------------------------------------
// Premio
// ---------------------------------------------------------------------------
const PRIZE_NONE =
  /\bno\s+(?:cash\s+)?prizes?\b|\bthere\s+(?:are|is)\s+no\s+prizes?\b|\bfor\s+fun,?\s+no\s+prizes?\b|\bjust\s+for\s+fun\b|\bsin\s+premios?\b|\bno\s+hay\s+premios?\b/i;
/** Señal de que hay algún premio (efectivo o en especie). */
const PRIZE_HINT =
  /\bin\s+prizes\b|\bprize\s+pool\b|\bgrand\s+prize\b|\bprizes?\b|\bpremi(?:o|os)\b|\breward(?:s|ed)?\b|\bcash\s+prize\b|\bbolsa\s+de\s+premios\b|\bbeca\b/i;
/** Señal de premio EN EFECTIVO (además del importe numérico). */
const CASH_HINT =
  /\bcash\s+prize\b|\bcash\b|\bpremio\s+en\s+(?:efectivo|met[aá]lico)\b|\bpaypal\b|\bin\s+prizes\b|\bprize\s+pool\b/i;
/** Importes monetarios: $, US$, USD, €, £, S/. con miles y sufijos k/M. */
const PRIZE_AMOUNT_G = /(?:\$|€|£|us\$|usd\s?|s\/\.?\s?)\s?(\d[\d.,]*\s?[km]?)/gi;
/** Premios EN ESPECIE (no efectivo). */
const INKIND: { re: RegExp; tag: string }[] = [
  { re: /\bsteam\s+keys?\b/i, tag: "steam keys" },
  { re: /\bgift\s+cards?\b/i, tag: "gift cards" },
  { re: /\basset\s+packs?\b/i, tag: "asset packs" },
  { re: /\basset\s+store\b/i, tag: "asset store" },
  { re: /\b(?:software|game)\s+licen[cs]es?\b/i, tag: "licenses" },
  { re: /\bhardware\b/i, tag: "hardware" },
  { re: /\bmerch(?:andise)?\b/i, tag: "merch" },
  { re: /\bswag\b/i, tag: "swag" },
];

function parseAmount(token: string): number | null {
  let t = token.toLowerCase().replace(/\s+/g, "");
  let mult = 1;
  if (t.endsWith("k")) {
    mult = 1_000;
    t = t.slice(0, -1);
  } else if (t.endsWith("m")) {
    mult = 1_000_000;
    t = t.slice(0, -1);
  }
  t = t.replace(/,/g, "");
  // Punto como separador de miles (p. ej. "10.000") → quitarlo.
  if (/^\d+\.\d{3}$/.test(t)) t = t.replace(".", "");
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : Math.round(n * mult);
}

/** Mayor importe monetario encontrado (o null). Aproxima no-USD a USD (sin tasas). */
function maxAmount(text: string): number | null {
  let best: number | null = null;
  for (const m of text.matchAll(PRIZE_AMOUNT_G)) {
    const raw = m[1];
    if (raw == null) continue;
    const value = parseAmount(raw);
    if (value != null && value > 0 && (best == null || value > best)) best = value;
  }
  return best;
}

function firstInKind(text: string): { tag: string } | null {
  for (const k of INKIND) if (k.re.test(text)) return { tag: k.tag };
  return null;
}

// ---------------------------------------------------------------------------
// Política de IA (maneja negaciones y variantes es/en; prohíbe > permite)
// ---------------------------------------------------------------------------
const AI_BANNED_PATTERNS: { re: RegExp; tag: string }[] = [
  { re: /\bno\s+(?:generative\s+)?a\.?i\.?\b/i, tag: "no ai" },
  { re: /\bwithout\s+(?:the\s+use\s+of\s+)?(?:generative\s+)?a\.?i\.?\b/i, tag: "without ai" },
  {
    re: /\b(?:generative\s+)?a\.?i\.?\s+(?:art\s+|tools?\s+|content\s+)?(?:is|are)\s+(?:not\s+(?:allowed|permitted|welcome)|prohibited|banned|forbidden)\b/i,
    tag: "ai is not allowed",
  },
  { re: /\b(?:no|not)\s+ai[-\s]?(?:generated|art|assets?|content|tools?)\b/i, tag: "no ai-generated" },
  { re: /\bai[-\s]?free\b/i, tag: "ai-free" },
  { re: /\b(?:human|hand)[-\s]?made\s+only\b/i, tag: "human-made only" },
  { re: /\bsin\s+(?:el\s+uso\s+de\s+)?ia\b/i, tag: "sin ia" },
  { re: /\bia\s+(?:generativa\s+)?(?:no\s+permitida|prohibida|no\s+est[aá]\s+permitida)\b/i, tag: "ia prohibida" },
  { re: /\bprohibid[ao]\s+(?:el\s+uso\s+de\s+)?(?:la\s+)?ia\b/i, tag: "prohibida la ia" },
  { re: /\bno\s+se\s+permite[^.?!]{0,24}\bia\b/i, tag: "no se permite ia" },
];
const AI_ALLOWED_PATTERNS: { re: RegExp; tag: string }[] = [
  {
    re: /\b(?:generative\s+)?a\.?i\.?\s+(?:is|are)\s+(?:allowed|permitted|welcome|encouraged|fine|ok(?:ay)?)\b/i,
    tag: "ai allowed",
  },
  { re: /\bai[-\s]?friendly\b/i, tag: "ai-friendly" },
  { re: /\b(?:you\s+(?:can|may)|feel\s+free\s+to)\s+use\s+(?:generative\s+)?ai\b/i, tag: "you can use ai" },
  { re: /\bia\s+(?:generativa\s+)?(?:est[aá]\s+)?permitida\b/i, tag: "ia permitida" },
  { re: /\bse\s+permite\s+(?:el\s+uso\s+de\s+)?(?:la\s+)?ia\b/i, tag: "se permite ia" },
];

function detectAi(text: string): { policy: AiPolicy; signal: string } | null {
  for (const p of AI_BANNED_PATTERNS) {
    if (p.re.test(text)) return { policy: "banned", signal: `ia=banned←"${p.tag}"` };
  }
  for (const p of AI_ALLOWED_PATTERNS) {
    if (p.re.test(text)) return { policy: "allowed", signal: `ia=allowed←"${p.tag}"` };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Motor / engine (solo si la señal es clara; el orden fija la prioridad)
// ---------------------------------------------------------------------------
const ENGINES: { engine: string; re: RegExp }[] = [
  { engine: "godot", re: /\bgodot\b/i },
  { engine: "unity", re: /\bunity\s*(?:engine|3d)?\b/i },
  { engine: "unreal", re: /\bunreal(?:\s*engine)?\b|\bue[45]\b/i },
  { engine: "gamemaker", re: /\bgame\s*maker(?:\s*studio)?\b|\bgms2?\b/i },
  { engine: "rpgmaker", re: /\brpg\s*maker\b/i },
  { engine: "construct", re: /\bconstruct\s*[23]\b|\bscirra\b/i },
  { engine: "renpy", re: /\bren['\s]?py\b/i },
  { engine: "twine", re: /\btwine\b/i },
  { engine: "bitsy", re: /\bbitsy\b/i },
  { engine: "pico8", re: /\bpico-?8\b/i },
  { engine: "phaser", re: /\bphaser\b/i },
  { engine: "love2d", re: /\b(?:l[öo]ve\s*2d|love2d|l[öo]ve\s+framework)\b/i },
  { engine: "html5", re: /\bhtml\s?5\b/i },
];

function detectEngine(text: string): { engine: string; signal: string } | null {
  for (const e of ENGINES) {
    const hit = firstHit(e.re, text);
    if (hit) return { engine: e.engine, signal: `motor=${e.engine}←"${hit}"` };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Solo / equipo (teamPolicy). "both" (solo o equipo) tiene prioridad.
// ---------------------------------------------------------------------------
const TEAM_BOTH =
  /\bsolo\s+or\s+(?:in\s+)?(?:a\s+)?teams?\b|\balone\s+or\s+in\s+(?:a\s+)?teams?\b|\bindividually\s+or\s+in\s+teams?\b|\bsolo\s*\/\s*team\b|\bsolo\s+o\s+en\s+equipo\b/i;
const TEAM_SOLO =
  /\bsolo\s+only\b|\bsolo\s+jam\b|\bno\s+teams?\b|\bindividual\s+only\b|\bmust\s+(?:work|be)\s+(?:alone|solo)\b|\bone\s+person\s+only\b|\bsingle\s+developer\s+only\b|\bsin\s+equipos?\b|\b(?:de\s+forma\s+|solo\s+)?individual(?:mente)?\b/i;
const TEAM_TEAM =
  /\bteams?\s+(?:are\s+)?(?:allowed|welcome|permitted|encouraged)\b|\bteams?\s+of\s+(?:up\s+to\s+)?\d+\b|\bin\s+teams?\b|\bform\s+a\s+team\b|\bwork\s+in\s+teams?\b|\bequipos?\s+(?:permitidos|de\s+hasta)\b|\ben\s+equipo\b/i;

function detectTeam(text: string): { team: "solo" | "team" | "both"; signal: string } | null {
  const both = firstHit(TEAM_BOTH, text);
  if (both) return { team: "both", signal: `equipo=both←"${both}"` };
  const solo = firstHit(TEAM_SOLO, text);
  if (solo) return { team: "solo", signal: `equipo=solo←"${solo}"` };
  const team = firstHit(TEAM_TEAM, text);
  if (team) return { team: "team", signal: `equipo=team←"${team}"` };
  return null;
}

function haystack(jam: Jam): string {
  return [jam.title, jam.theme, ...jam.tags, jam.prizeSummary, ...jam.hosts.map((h) => h.name)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Heurísticas por reglas. Con `detailText` (pass 2) los patrones corren sobre el
 * texto de la página de detalle y la confianza sube (piso 0.8 → caché). No muta
 * el input; devuelve una copia con `enrichmentVersion` y `enrichmentSignals`.
 */
export function enrichHeuristics(jam: Jam, detailText?: string): Jam {
  const detail = detailText?.toLowerCase() ?? "";
  const hasDetail = detail.length > 0;
  const text = hasDetail ? `${haystack(jam)} ${detail}` : haystack(jam);
  const signals: string[] = [];

  // --- idioma ---
  let languages = jam.languages;
  let langDetected = false;
  if (languages.length === 0) {
    languages = looksSpanish(text) ? ["es"] : ["en"];
    langDetected = true;
    signals.push(`idioma=${languages[0]}`);
  } else if (hasDetail && languages.join(",") === "en" && looksSpanish(detail)) {
    languages = ["es"];
    langDetected = true;
    signals.push(`idioma=es←detalle`);
  }

  // --- premio (sólo si es desconocido: null) — distingue efectivo vs especie ---
  let hasPrize = jam.hasPrize;
  let prizeValueUsd = jam.prizeValueUsd;
  let prizeSummary = jam.prizeSummary;
  let prizeDetected = false;
  let cashDetected = false;
  if (hasPrize == null) {
    if (PRIZE_NONE.test(text)) {
      hasPrize = false;
      prizeDetected = true;
      signals.push(`premio=no←"${firstHit(PRIZE_NONE, text)}"`);
    } else {
      const amount = maxAmount(text);
      const inKind = firstInKind(text);
      const cashy = amount != null || CASH_HINT.test(text);
      if (amount != null || inKind || PRIZE_HINT.test(text)) {
        hasPrize = true;
        prizeDetected = true;
        if (amount != null) {
          // EFECTIVO: hay una cifra monetaria.
          cashDetected = true;
          if (prizeValueUsd == null) prizeValueUsd = amount;
          prizeSummary = prizeSummary ?? `$${amount.toLocaleString("en-US")}`;
          signals.push(`premio=cash $${amount}←"${firstHit(PRIZE_AMOUNT_G, text)}"`);
        } else if (inKind) {
          // EN ESPECIE: keys/asset packs/gift cards… sin cifra.
          prizeSummary = prizeSummary ?? `Premio en especie (${inKind.tag})`;
          signals.push(`premio=especie(${inKind.tag})`);
        } else {
          // Hay premio pero sin cifra ni tipo claro.
          prizeSummary = prizeSummary ?? (cashy ? "Premio en efectivo" : "Con premio");
          signals.push(`premio=${cashy ? "efectivo?" : "sí"}←"${firstHit(PRIZE_HINT, text)}"`);
        }
      }
    }
  }

  // --- política de IA (sólo si unknown) ---
  let aiPolicy: AiPolicy = jam.aiPolicy;
  let aiDetected = false;
  if (aiPolicy === "unknown") {
    const ai = detectAi(text);
    if (ai) {
      aiPolicy = ai.policy;
      aiDetected = true;
      signals.push(ai.signal);
    }
  }

  // --- motor / engine (sólo si no viene ya de la fuente) ---
  let engine = jam.engine ?? null;
  let engineDetected = false;
  if (engine == null) {
    const e = detectEngine(text);
    if (e) {
      engine = e.engine;
      engineDetected = true;
      signals.push(e.signal);
    }
  }

  // --- solo / equipo (sólo si no viene ya de la fuente) ---
  let teamPolicy = jam.teamPolicy ?? null;
  let teamDetected = false;
  if (teamPolicy == null) {
    const t = detectTeam(text);
    if (t) {
      teamPolicy = t.team;
      teamDetected = true;
      signals.push(t.signal);
    }
  }

  // --- confianza ---
  const enrichmentConfidence = hasDetail
    ? Math.min(
        0.96,
        Math.max(0.8, jam.enrichmentConfidence) +
          (prizeDetected ? 0.04 : 0) +
          (cashDetected ? 0.03 : 0) +
          (aiDetected ? 0.08 : 0) +
          (engineDetected ? 0.02 : 0) +
          (teamDetected ? 0.02 : 0),
      )
    : Math.min(
        0.8,
        jam.enrichmentConfidence +
          (langDetected ? 0.05 : 0) +
          (prizeDetected ? 0.1 : 0) +
          (aiDetected ? 0.15 : 0) +
          (engineDetected ? 0.05 : 0) +
          (teamDetected ? 0.05 : 0),
      );

  return {
    ...jam,
    languages,
    hasPrize,
    prizeValueUsd,
    prizeSummary,
    aiPolicy,
    engine,
    teamPolicy,
    enrichmentConfidence,
    enrichmentVersion: ENRICH_VERSION,
    enrichmentSignals: signals.length ? signals.join("; ").slice(0, 300) : (jam.enrichmentSignals ?? null),
  };
}
