/**
 * Utilidades compartidas por los adapters de fuente.
 * User-Agent identificable + fetch con manejo de errores + helpers puros de fecha/conteo.
 * Sin dependencias de la UI ni de red persistente.
 */
import { request as httpsRequest } from "node:https";

export const USER_AGENT =
  "ShadowGamesJamRadar/0.1 (+https://shadowgames.studio; contacto@shadowgames.studio)";

export interface FetchOptions {
  /** Cabeceras extra. */
  headers?: Record<string, string>;
  /** ms antes de abortar (default 15000). */
  timeoutMs?: number;
  /** Dispatcher de undici (p. ej. para TLS laxo en Ludum Dare). */
  dispatcher?: unknown;
}

async function doFetch(url: string, accept: string, opts: FetchOptions = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept,
        ...opts.headers,
      },
      // `dispatcher` es una extensión de undici aceptada por el fetch de Node.
      ...(opts.dispatcher ? { dispatcher: opts.dispatcher } : {}),
    } as RequestInit);
    if (!res.ok) {
      throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Descarga texto (HTML) con el UA del radar. Lanza si !res.ok. */
export async function fetchText(url: string, opts?: FetchOptions): Promise<string> {
  const res = await doFetch(
    url,
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    opts,
  );
  return res.text();
}

/** Descarga y parsea JSON con el UA del radar. Lanza si !res.ok. */
export async function fetchJson<T>(url: string, opts?: FetchOptions): Promise<T> {
  const res = await doFetch(url, "application/json,text/plain,*/*", opts);
  return (await res.json()) as T;
}

/**
 * GET tolerante a certificados TLS inválidos (p. ej. cert VENCIDO de Ludum Dare).
 * Usa node:https con rejectUnauthorized:false — mantiene SNI/Host correctos (al
 * contrario que `curl -k`). SÓLO para APIs PÚBLICAS de solo-lectura, sin secretos
 * (no se envían credenciales). Lanza en !2xx / error / timeout.
 */
export function fetchInsecureText(url: string, opts: FetchOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (e) {
      reject(e as Error);
      return;
    }
    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: {
          "user-agent": USER_AGENT,
          accept: "application/json,text/plain,*/*",
          ...opts.headers,
        },
        rejectUnauthorized: false,
        timeout: opts.timeoutMs ?? 15000,
      },
      (res) => {
        const code = res.statusCode ?? 0;
        if (code < 200 || code >= 300) {
          res.resume();
          reject(new Error(`GET ${url} → ${code}`));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`GET ${url} → timeout`));
    });
    req.end();
  });
}

/** JSON vía `fetchInsecureText` (TLS laxo). Lanza si no parsea o !2xx. */
export async function fetchInsecureJson<T>(url: string, opts?: FetchOptions): Promise<T> {
  return JSON.parse(await fetchInsecureText(url, opts)) as T;
}

// ---------------------------------------------------------------------------
// Helpers puros
// ---------------------------------------------------------------------------

/** Suma (o resta) días a una fecha ISO y devuelve ISO. Devuelve el input si es inválido. */
export function addDaysIso(iso: string, days: number): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms + days * 86_400_000).toISOString();
}

/**
 * Parsea una duración textual a días.
 * Soporta hora(s)/hour(s), día(s)/day(s), semana(s)/week(s), mes(es)/month(s).
 */
export function parseDurationDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text
    .toLowerCase()
    .match(/(\d+(?:[.,]\d+)?)\s*(hour|hora|day|día|dia|week|semana|month|mes)/);
  if (!m) return null;
  const n = parseFloat(m[1]!.replace(",", "."));
  if (Number.isNaN(n)) return null;
  const unit = m[2];
  if (unit === "hour" || unit === "hora") return round2(n / 24);
  if (unit === "day" || unit === "día" || unit === "dia") return n;
  if (unit === "week" || unit === "semana") return n * 7;
  if (unit === "month" || unit === "mes") return n * 30;
  return null;
}

/** Parsea conteos tipo "21.6k", "1,940", "2.3M" → número entero. */
export function parseCount(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.trim().toLowerCase().replace(/,/g, "");
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*([km])?/);
  if (!m) return null;
  let n = parseFloat(m[1]!);
  if (Number.isNaN(n)) return null;
  if (m[2] === "k") n *= 1_000;
  else if (m[2] === "m") n *= 1_000_000;
  return Math.round(n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
