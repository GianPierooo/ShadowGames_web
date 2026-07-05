import type { Jam } from "../types";
import { fetchJson } from "./_shared";

/**
 * Ludum Dare expone una API JSON, pero su certificado TLS suele estar VENCIDO
 * (el fetch da error de cert o 503). Este adapter es TOLERANTE: ante cualquier
 * fallo devuelve [] y loguea el motivo, sin tumbar la ingesta del resto.
 *
 * LD no reparte premios en metálico; las fechas/detalle finos quedan para Fase 4.
 */
const FEED_URL = "https://api.ldjam.com/vx/node/feed/9/parent/event";
const NODE_URL = "https://api.ldjam.com/vx/node2/get/";

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
    const feed = await fetchJson<{ feed?: LdFeedItem[] }>(FEED_URL, {
      timeoutMs: 8000,
    });
    const ids = (feed.feed ?? [])
      .map((f) => f.id)
      .filter((id): id is number => typeof id === "number")
      .slice(0, 12);
    if (ids.length === 0) return [];

    const res = await fetchJson<{ node?: LdNode[] }>(
      `${NODE_URL}${ids.join("+")}`,
      { timeoutMs: 8000 },
    );
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
