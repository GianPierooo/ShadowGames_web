import type { Jam } from "../types";
import { fetchInsecureJson, fetchJson } from "./_shared";

/**
 * Ludum Dare expone una API JSON, pero su certificado TLS está VENCIDO
 * (notAfter 16-jun-2026). Estrategia ROBUSTA: intentamos primero el fetch
 * seguro; si falla, reintentamos con TLS laxo (node:https, rejectUnauthorized
 * false) porque es una API pública de solo-lectura sin secretos. Cuando renueven
 * el cert, el fetch seguro vuelve a funcionar y el fallback deja de usarse SOLO
 * (sin tocar código). Ante fallo total, devuelve [] y loguea, sin tumbar el resto.
 *
 * Poner ALLOW_INSECURE_TLS = false para exigir cert válido (desactiva el fallback).
 *
 * LD no reparte premios en metálico; las fechas/detalle finos quedan para Fase 4.
 */
const FEED_URL = "https://api.ldjam.com/vx/node/feed/9/parent/event";
const NODE_URL = "https://api.ldjam.com/vx/node2/get/";
const ALLOW_INSECURE_TLS = true;

/** GET a la API de LD: fetch seguro y, si falla, reintento con TLS laxo (cert vencido). */
async function ldGet<T>(url: string): Promise<T> {
  try {
    return await fetchJson<T>(url, { timeoutMs: 8000 });
  } catch (err) {
    if (!ALLOW_INSECURE_TLS) throw err;
    console.warn(
      `[ludumdare] fetch seguro falló (${err instanceof Error ? err.message : String(err)}); reintento con TLS laxo (cert vencido).`,
    );
    return fetchInsecureJson<T>(url, { timeoutMs: 8000 });
  }
}

interface LdFeedItem {
  id?: number;
}
interface LdNode {
  id?: number;
  name?: string;
  path?: string;
}

export async function fetchLudumDareJams(): Promise<Jam[]> {
  try {
    const feed = await ldGet<{ feed?: LdFeedItem[] }>(FEED_URL);
    const ids = (feed.feed ?? [])
      .map((f) => f.id)
      .filter((id): id is number => typeof id === "number")
      .slice(0, 12);
    if (ids.length === 0) return [];

    const res = await ldGet<{ node?: LdNode[] }>(`${NODE_URL}${ids.join("+")}`);
    return (res.node ?? [])
      .map(toJam)
      .filter((j): j is Jam => j !== null);
  } catch (err) {
    console.warn(
      `[ludumdare] fuente no disponible (cert vencido / 503): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return [];
  }
}

function toJam(node: LdNode): Jam | null {
  const title = node.name?.trim();
  if (!title || !node.id) return null;
  const url = node.path
    ? `https://ldjam.com${node.path}`
    : `https://ldjam.com/events/ludum-dare/${node.id}`;

  return {
    source: "ludumdare",
    sourceId: String(node.id),
    url,
    title,
    hosts: [{ name: "Ludum Dare", url: "https://ldjam.com" }],
    startAt: null,
    endAt: null,
    durationDays: null,
    theme: null,
    tags: [],
    languages: [],
    hasPrize: false,
    prizeSummary: null,
    prizeValueUsd: null,
    aiPolicy: "unknown",
    mode: "online",
    participants: null,
    country: null,
    ranked: true,
    featured: false,
    enrichmentConfidence: 0.3,
  };
}
