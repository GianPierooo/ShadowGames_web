import * as cheerio from "cheerio";
import { request as httpsRequest } from "node:https";
import type { Jam } from "../types";
import { USER_AGENT, fetchText } from "./_shared";

/**
 * CVA Perú — Patrimonio Game Jam (videojuegos sobre patrimonio cultural
 * inmaterial del Perú). La convocatoria vive en itch.io; `cva.pe` sólo la
 * enlaza (y ahora mismo está parqueada, con cert TLS mal configurado).
 *
 * Estacionalidad: sólo devolvemos la jam si hay una edición VIGENTE (deadline en
 * el futuro). Si la última edición ya cerró, devolvemos [] (no inventamos fechas
 * ni mostramos ediciones pasadas) y lo logueamos.
 */
const CVA_LANDING = "https://cva.pe/patrimoniogamejam/";
const DEFAULT_ITCH_JAM = "https://itch.io/jam/patrimonio-game-jam";

export async function fetchCvaJams(): Promise<Jam[]> {
  try {
    // 1) Intentar descubrir el itch de la edición vigente desde cva.pe (tolerante
    //    al cert roto / sitio parqueado): si trae un enlace itch, lo usamos.
    let itchUrl = DEFAULT_ITCH_JAM;
    const landing = await getInsecure(CVA_LANDING);
    const linkFromCva = landing?.match(
      /https?:\/\/[a-z0-9.-]*itch\.io\/jam\/[a-z0-9-]+/i,
    )?.[0];
    if (linkFromCva) {
      itchUrl = linkFromCva;
    } else {
      console.log(
        `[cva-pe] cva.pe sin datos vigentes (parqueada / sin enlace); uso ${DEFAULT_ITCH_JAM}.`,
      );
    }

    // 2) Leer la página de la jam en itch (cert válido).
    const html = await fetchText(itchUrl);
    const $ = cheerio.load(html);
    const { startAt, endAt } = extractEditionDates($, html);

    // Estacionalidad: sólo si hay edición abierta (deadline futuro).
    if (!endAt || Date.parse(endAt) <= Date.now()) {
      console.log(
        `[cva-pe] sin edición abierta (última cerró ${endAt ?? "desconocida"}). Devuelvo [].`,
      );
      return [];
    }

    const title = pageTitle($) ?? "Patrimonio Game Jam";
    const slug =
      itchUrl.match(/\/jam\/([^/?#]+)/)?.[1] ?? "patrimonio-game-jam";
    const body = $(".user_formatted, .jam_content").text();
    const hasPrize =
      /\bpremi|\bprize|\bbeca\b|reward|\$\s?\d|€\s?\d|s\/\.?\s?\d/i.test(body)
        ? true
        : null;

    console.log(`[cva-pe] edición VIGENTE: "${title}" ${startAt ?? "?"} → ${endAt}.`);
    return [
      {
        source: "cva-pe",
        sourceId: slug,
        url: itchUrl,
        title,
        hosts: [{ name: "CVA Perú", url: "https://cva.pe" }],
        startAt,
        endAt,
        durationDays: startAt
          ? Math.round((Date.parse(endAt) - Date.parse(startAt)) / 86_400_000)
          : null,
        theme: "Patrimonio cultural inmaterial del Perú",
        tags: ["Convocatoria", "Patrimonio", "Perú"],
        languages: ["es"],
        hasPrize,
        prizeSummary: null,
        prizeValueUsd: null,
        aiPolicy: "unknown",
        mode: "online",
        participants: null,
        country: "PE",
        ranked: true,
        featured: false,
        enrichmentConfidence: 0.75,
      },
    ];
  } catch (err) {
    console.warn(
      `[cva-pe] fuente no disponible: ${err instanceof Error ? err.message : String(err)}`,
    );
    return [];
  }
}

/** Título limpio desde <title> ("Patrimonio Game Jam - itch.io" → "Patrimonio Game Jam"). */
function pageTitle($: ReturnType<typeof cheerio.load>): string | null {
  const t = ($("title").first().text() || "")
    .replace(/\s*[-–|]\s*itch\.io\s*$/i, "")
    .trim();
  return t || null;
}

/** Convierte "YYYY-MM-DD HH:MM:SS" (o con T/Z) a ISO UTC, o null. */
function toIsoUtc(raw: string): string | null {
  const m = raw.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const ms = Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/**
 * Fechas de la edición desde la página itch:
 *  - jam abierta → spans `.date_countdown` (title/text con la fecha),
 *  - jam cerrada → texto "ran from A to B".
 * start = fecha más temprana, end = más tardía. null si no hay fechas.
 */
function extractEditionDates($: ReturnType<typeof cheerio.load>, html: string) {
  const times: number[] = [];

  // Jam abierta: spans de cuenta regresiva (estilo listado).
  $(".date_countdown").each((_, el) => {
    const iso = toIsoUtc($(el).attr("title") ?? "") ?? toIsoUtc($(el).text());
    if (iso) times.push(Date.parse(iso));
  });

  // Jam cerrada: "It ran from <fecha> to <fecha>" (tolerante a markup entre medio).
  const ran = html.match(
    /ran from[\s\S]{0,40}?(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})[\s\S]{0,30}?to[\s\S]{0,40}?(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})/i,
  );
  if (ran) {
    for (const raw of [ran[1], ran[2]]) {
      if (!raw) continue;
      const iso = toIsoUtc(raw);
      if (iso) times.push(Date.parse(iso));
    }
  }

  // Fallback: cualquier datetime de la página (min/max) para no perder la fecha.
  if (times.length === 0) {
    for (const m of html.matchAll(/\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/g)) {
      const iso = toIsoUtc(m[0]);
      if (iso) times.push(Date.parse(iso));
    }
  }

  if (times.length === 0) return { startAt: null, endAt: null };
  times.sort((a, b) => a - b);
  return {
    startAt: new Date(times[0]!).toISOString(),
    endAt: new Date(times[times.length - 1]!).toISOString(),
  };
}

/** GET tolerante al cert (cva.pe usa cert de hosting compartido mal configurado). */
function getInsecure(url: string, timeoutMs = 8000): Promise<string | null> {
  return new Promise((resolve) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      resolve(null);
      return;
    }
    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: { "user-agent": USER_AGENT },
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      },
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}
