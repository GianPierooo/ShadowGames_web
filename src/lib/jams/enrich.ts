import type { AiPolicy, Jam } from "./types";

/**
 * Enriquecimiento por REGLAS/REGEX (sin IA). Un único `enrichHeuristics`:
 *  - Pass 1 (sin detalle): patrones sobre título/tema/tags/premio/hosts.
 *  - Pass 2 (con `detailText`): los mismos patrones sobre el texto de la página
 *    de detalle (mucho más rico → premio/IA/idioma). Sube la confianza.
 * Sin señal concluyente → aiPolicy "unknown" (estado honesto, no se inventa).
 */

// --- idioma (español) ---
const ES_ACCENT = /[áéíóúñ¿¡]/;
const ES_KEYWORD =
  /\b(videojuego|convocatoria|beca|premio|espa[nñ]ol|narrativa|desarrollo|concurso|reglas|participa|jam\s+de)\b/i;
const ES_STOPWORDS =
  /\b(que|para|con|los|las|una|del|por|como|pero|este|esta|muy|sobre|donde|cuando)\b/gi;

function looksSpanish(text: string): boolean {
  if (ES_ACCENT.test(text) || ES_KEYWORD.test(text)) return true;
  return (text.match(ES_STOPWORDS)?.length ?? 0) >= 4;
}

// --- premio ---
const PRIZE_NONE =
  /\bno\s+prizes?\b|\bno\s+cash\s+prize|\bthere\s+are\s+no\s+prizes|\bsin\s+premios?\b|\bno\s+hay\s+premios?\b/i;
const PRIZE_HINT =
  /\$\s?\d|€\s?\d|£\s?\d|s\/\.?\s?\d|\bin\s+prizes\b|\bprize\s+pool\b|\bprizes?\b|\bpremi(?:o|os)\b|\bbeca\b|\breward\b|\bbolsa\s+de\s+premios\b|\bcash\s+prize\b/i;
const PRIZE_AMOUNT_G =
  /(?:\$|€|£|us\$|usd\s?|s\/\.?\s?)\s?(\d[\d.,]*\s?[km]?)/gi;

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

/** Mayor importe monetario encontrado en el texto (o null). */
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

// --- política de IA ---
const AI_BANNED =
  /\bno\s+(?:generative\s+)?a\.?i\.?\b|\bai\s+is\s+not\s+allowed\b|\bno\s+ai[-\s]?generated\b|\bai[-\s]?free\b|\bno\s+generative\s+ai\b|\bgenerative\s+ai\s+is\s+(?:not\s+allowed|prohibited|banned|forbidden)\b|\bno\s+ai\s+art\b|\bai\s+art\s+is\s+not\s+allowed\b|\bsin\s+ia\b|\bia\s+(?:generativa\s+)?(?:prohibida|no\s+permitida|no\s+est[aá]\s+permitida)\b|\bprohibida\s+la\s+ia\b/i;
const AI_ALLOWED =
  /\bai\s+(?:is\s+)?(?:allowed|permitted|encouraged|welcome)\b|\bgenerative\s+ai\s+is\s+allowed\b|\bai[-\s]?friendly\b|\bia\s+(?:est[aá]\s+)?permitida\b|\bse\s+permite\s+(?:el\s+uso\s+de\s+)?(?:la\s+)?ia\b/i;

function haystack(jam: Jam): string {
  return [jam.title, jam.theme, ...jam.tags, jam.prizeSummary, ...jam.hosts.map((h) => h.name)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Heurísticas por reglas. Con `detailText` (pass 2) los patrones corren sobre
 * el texto de la página de detalle y la confianza sube (y se fija piso 0.8 para
 * marcar la jam como ya procesada → cacheo, no se vuelve a bajar el detalle).
 * Devuelve una copia; no muta el input.
 */
export function enrichHeuristics(jam: Jam, detailText?: string): Jam {
  const detail = detailText?.toLowerCase() ?? "";
  const hasDetail = detail.length > 0;
  const text = hasDetail ? `${haystack(jam)} ${detail}` : haystack(jam);

  // --- idioma ---
  let languages = jam.languages;
  let langDetected = false;
  if (languages.length === 0) {
    languages = looksSpanish(text) ? ["es"] : ["en"];
    langDetected = true;
  } else if (hasDetail && languages.join(",") === "en" && looksSpanish(detail)) {
    // El detalle revela que en realidad la convocatoria es en español.
    languages = ["es"];
    langDetected = true;
  }

  // --- premio (sólo si es desconocido: null) ---
  let hasPrize = jam.hasPrize;
  let prizeValueUsd = jam.prizeValueUsd;
  let prizeSummary = jam.prizeSummary;
  let prizeDetected = false;
  if (hasPrize == null) {
    if (PRIZE_NONE.test(text)) {
      hasPrize = false;
      prizeDetected = true;
    } else if (PRIZE_HINT.test(text)) {
      hasPrize = true;
      prizeDetected = true;
      const amount = maxAmount(text);
      if (amount != null && prizeValueUsd == null) {
        prizeValueUsd = amount;
        prizeSummary = prizeSummary ?? `$${amount.toLocaleString("en-US")}`;
      }
      prizeSummary = prizeSummary ?? "Con premio";
    }
  }

  // --- política de IA (sólo si unknown) ---
  let aiPolicy: AiPolicy = jam.aiPolicy;
  let aiDetected = false;
  if (aiPolicy === "unknown") {
    if (AI_BANNED.test(text)) {
      aiPolicy = "banned";
      aiDetected = true;
    } else if (AI_ALLOWED.test(text)) {
      aiPolicy = "allowed";
      aiDetected = true;
    }
  }

  // --- confianza ---
  const enrichmentConfidence = hasDetail
    ? // Ya bajamos el detalle → piso 0.8 (marca "procesada"), bonus por señales.
      Math.min(
        0.92,
        Math.max(0.8, jam.enrichmentConfidence) +
          (prizeDetected ? 0.04 : 0) +
          (aiDetected ? 0.08 : 0),
      )
    : Math.min(
        0.8,
        jam.enrichmentConfidence +
          (langDetected ? 0.05 : 0) +
          (prizeDetected ? 0.1 : 0) +
          (aiDetected ? 0.15 : 0),
      );

  return {
    ...jam,
    languages,
    hasPrize,
    prizeValueUsd,
    prizeSummary,
    aiPolicy,
    enrichmentConfidence,
  };
}
