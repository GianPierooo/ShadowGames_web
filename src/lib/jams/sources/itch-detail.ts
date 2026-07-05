import * as cheerio from "cheerio";
import { fetchText } from "./_shared";

/**
 * Descarga la página de detalle de una jam de itch y extrae el texto relevante
 * (descripción / reglas), limpio de HTML y recortado. El listado no trae
 * premio/tema/política de IA; esos datos viven aquí y los usa el pass 2 (LLM).
 */
const MAX_CHARS = 6000;

export async function fetchItchDetail(url: string): Promise<string> {
  const html = await fetchText(url, { timeoutMs: 15000 });
  const $ = cheerio.load(html);

  // La descripción formateada vive en .user_formatted (fallback .jam_content).
  let text = $(".user_formatted").first().text();
  if (!text.trim()) text = $(".jam_content").first().text();

  return text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
}
