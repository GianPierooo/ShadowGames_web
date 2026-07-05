import * as cheerio from "cheerio";
import { fetchText } from "./_shared";

/**
 * Descarga la página de detalle de una jam de itch y extrae el texto relevante
 * (descripción / reglas / zona de contenido principal), limpio de HTML y
 * recortado. El listado no trae premio/tema/política de IA; esos datos viven aquí
 * y los usa el pass 2 (heurísticas de enrich.ts). Tolerante: ante cualquier fallo
 * (red, timeout, HTML inesperado) devuelve null sin romper la ingesta.
 */
const MAX_CHARS = 8000;

export async function fetchItchDetail(url: string): Promise<string | null> {
  try {
    const html = await fetchText(url, { timeoutMs: 15000 });
    const $ = cheerio.load(html);

    // Zona principal: `.user_formatted` (descripción formateada) y `.jam_content`
    // (cuerpo de la jam, que suele incluir reglas). Nos quedamos con la más rica.
    const formatted = $(".user_formatted").first().text();
    const content = $(".jam_content").first().text();
    const text = (content.length > formatted.length ? content : formatted)
      .replace(/\s+/g, " ")
      .trim();

    return text ? text.slice(0, MAX_CHARS) : null;
  } catch (err) {
    console.warn(
      `[itch-detail] no se pudo bajar ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}
