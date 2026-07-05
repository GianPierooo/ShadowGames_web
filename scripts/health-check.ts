/**
 * Chequeo de SALUD DE ESTRUCTURA (en vivo). Hace fetch real a cada fuente y
 * verifica que los SELECTORES/CLAVES clave siguen existiendo. NO corre en el build
 * normal ni en CI (es un script tsx aparte):
 *
 *   npm run test:health
 *
 * Semántica:
 *  - Un SELECTOR/CLAVE que desapareció → FALLA (exit 1) con mensaje claro
 *    ("itch cambió su estructura: falta .date_countdown") para avisar de que hay
 *    que actualizar el adapter (y re-capturar el fixture: ver __fixtures__/README.md).
 *  - Un fallo de RED / fuente caída → SKIP con aviso (NO rompe: exit 0). Así el
 *    check no depende de la red.
 */
import * as cheerio from "cheerio";
import { fetchJson, fetchText } from "../src/lib/jams/sources/_shared";

const DEVPOST_URL =
  "https://devpost.com/api/hackathons?status[]=open&status[]=upcoming&per_page=5";
const CULTURA_URL =
  "https://estimuloseconomicos.cultura.gob.pe/2026/estimulos-economicos-para-la-actividad-cinematografica-y-audiovisual-2026";

interface Check {
  name: string;
  /** Devuelve la lista de problemas (vacía = estructura OK). Puede lanzar (→ red/skip). */
  run: () => Promise<string[]>;
}

const checks: Check[] = [
  {
    name: "itch",
    run: async () => {
      const $ = cheerio.load(await fetchText("https://itch.io/jams/upcoming", { timeoutMs: 15000 }));
      const problems: string[] = [];
      if ($("div.jam.lazy_images").length === 0) problems.push("falta div.jam.lazy_images");
      if ($(".primary_info h3 a").length === 0) problems.push("falta .primary_info h3 a");
      if ($(".date_countdown").length === 0) problems.push("falta .date_countdown");
      return problems;
    },
  },
  {
    name: "devpost",
    run: async () => {
      const data = await fetchJson<{ hackathons?: Record<string, unknown>[] }>(DEVPOST_URL, {
        timeoutMs: 15000,
      });
      const problems: string[] = [];
      if (!Array.isArray(data.hackathons)) problems.push("la respuesta no trae hackathons[]");
      else if (data.hackathons.length > 0 && !("prize_amount" in data.hackathons[0]!))
        problems.push("los hackathons ya no traen prize_amount");
      return problems;
    },
  },
  {
    name: "globalgamejam",
    run: async () => {
      const html = await fetchText("https://globalgamejam.org/", { timeoutMs: 15000 });
      return /Jam\s*Dates/i.test(html) ? [] : ["falta el texto 'Jam Dates' en la home"];
    },
  },
  {
    name: "alakajam",
    run: async () => {
      const data = await fetchJson<Record<string, unknown>[]>(
        "https://alakajam.com/api/event",
        { timeoutMs: 15000 },
      );
      const problems: string[] = [];
      if (!Array.isArray(data)) problems.push("la API no devolvió un array de eventos");
      else if (data.length > 0 && !("display_dates" in data[0]!))
        problems.push("los eventos ya no traen display_dates");
      return problems;
    },
  },
  {
    name: "cultura-pe",
    run: async () => {
      const $ = cheerio.load(await fetchText(CULTURA_URL, { timeoutMs: 15000 }));
      return $('a[href*="/concursos/"]').length > 0
        ? []
        : ["falta a[href*='/concursos/'] (¿cambió la página o la edición?)"];
    },
  },
  {
    // Ludum Dare: su API (api.ldjam.com) tiene el cert TLS vencido (jun-2026) y
    // además da 400 por Akamai. Se espera SKIP hasta que la reactiven.
    name: "ludumdare",
    run: async () => {
      await fetchJson("https://api.ldjam.com/vx/node/feed/9/parent/event", { timeoutMs: 8000 });
      return [];
    },
  },
];

async function main() {
  let failed = 0;
  let skipped = 0;
  for (const c of checks) {
    try {
      const problems = await c.run();
      if (problems.length > 0) {
        failed++;
        console.error(`✗ ${c.name} cambió su estructura: ${problems.join("; ")}`);
      } else {
        console.log(`✓ ${c.name}: estructura OK`);
      }
    } catch (err) {
      skipped++;
      console.warn(
        `⚠ ${c.name}: no se pudo verificar (red/fuente caída) → SKIP: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
  const ok = checks.length - failed - skipped;
  console.log(`\nSalud de estructura: ${ok} OK · ${failed} con cambios · ${skipped} sin verificar (red).`);
  // Solo un cambio de estructura real rompe; un fallo de red NO.
  process.exit(failed > 0 ? 1 : 0);
}

main();
