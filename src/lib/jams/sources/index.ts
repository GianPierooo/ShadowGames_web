import type { Jam, JamSource } from "../types";
import { fetchItchJams } from "./itch";
import { fetchDevpostJams } from "./devpost";
import { fetchCulturaPeJams } from "./cultura-pe";
import { fetchLudumDareJams } from "./ludumdare";
import { fetchCvaJams } from "./cva-pe";

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
];

// TODO(convocatorias hispanas): investigadas pero NO añadidas por ahora
// (calidad > cantidad; se documentan aquí para retomar cuando tengan datos
// vigentes y scrapeables):
//   - IndieDevDay (indiedevday.es): sitio-archivo de ediciones pasadas; la 2025
//     fue en octubre. Sin convocatoria/awards vigente con deadline scrapeable.
//   - PlayStation Talents (playstationtalents.es): sitio JS-heavy, sin listado
//     estable de convocatoria con fecha/premio parseable por HTML plano.
//   - Fondos culturales LatAm (Fondart Chile, IberCultura): páginas pesadas y
//     sin línea de videojuego consistente/scrapeable. Retomar por fuente concreta.

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
};
