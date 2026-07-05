import type { Jam, JamSource } from "../types";
import { fetchItchJams } from "./itch";
import { fetchDevpostJams } from "./devpost";
import { fetchCulturaPeJams } from "./cultura-pe";
import { fetchLudumDareJams } from "./ludumdare";
import { fetchCvaJams } from "./cva-pe";
import { fetchAlakajamJams } from "./alakajam";
import { fetchGlobalGameJamJams } from "./globalgamejam";

export interface Adapter {
  source: JamSource;
  run: () => Promise<Jam[]>;
}

export const ADAPTERS: Adapter[] = [
  { source: "itch", run: fetchItchJams },
  { source: "devpost", run: fetchDevpostJams },
  { source: "cultura-pe", run: fetchCulturaPeJams },
  { source: "cva-pe", run: fetchCvaJams },
  { source: "ludumdare", run: fetchLudumDareJams },
  { source: "alakajam", run: fetchAlakajamJams },
  { source: "globalgamejam", run: fetchGlobalGameJamJams },
];

// TODO(fuentes evaluadas en Fase 3 pero NO añadidas — calidad > cantidad):
//   - IndieGameJams.com: es un agregador de alto valor, PERO la home es una SPA
//     client-side (el HTML server-rendered llega casi vacío, ~233 bytes; el
//     calendario lo pinta JS). No scrapeable con cheerio sin un navegador
//     headless. Retomar si publican un feed/JSON o SSR.
//   - gm48.net (GameMaker 48h): comunidad dormida (sin ediciones recientes);
//     revisar si reactivan el calendario.
//   - GMC Jam (GameMaker Community): vive en un hilo de foro; sin markup
//     estructurado estable ni fechas parseables de forma fiable.
//   - GMTK Game Jam: NO necesita adapter propio — se publica como jam de itch.io,
//     así que ya la capta el adapter `itch`.
//   - Convocatorias hispanas: IndieDevDay (indiedevday.es) y PlayStation Talents
//     son sitios-archivo / JS-heavy sin deadline vigente scrapeable en HTML plano;
//     Fondos culturales LatAm (Fondart Chile, IberCultura) sin línea de videojuego
//     consistente. Retomar por fuente concreta cuando publiquen convocatoria abierta.

/** Conteo si fue bien, o "error: …" si la fuente falló. */
export type AdapterReport = Record<JamSource, number | string>;

/**
 * Corre TODOS los adapters con Promise.allSettled: el fallo de una fuente no
 * tumba al resto. Devuelve las jams crudas + un reporte por fuente.
 */
export async function runAllAdapters(): Promise<{
  jams: Jam[];
  report: AdapterReport;
}> {
  const results = await Promise.allSettled(ADAPTERS.map((a) => a.run()));

  const jams: Jam[] = [];
  const report = {} as AdapterReport;

  results.forEach((result, i) => {
    const adapter = ADAPTERS[i];
    if (!adapter) return;
    const { source } = adapter;
    if (result.status === "fulfilled") {
      jams.push(...result.value);
      report[source] = result.value.length;
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      report[source] = `error: ${reason}`;
    }
  });

  return { jams, report };
}

export {
  fetchItchJams,
  fetchDevpostJams,
  fetchCulturaPeJams,
  fetchCvaJams,
  fetchLudumDareJams,
  fetchAlakajamJams,
  fetchGlobalGameJamJams,
};
