/**
 * Modelo de datos del Radar de Jams. Sin dependencias de red:
 * es sólo la forma del dato que más adelante producirán scrapers/enriquecedores.
 */

/** IDs canónicos de fuente. Son la FUENTE DE VERDAD del dato.
 *  Las etiquetas/colores visibles viven en `labels.ts`, no aquí. */
export type JamSource =
  | "itch"
  | "devpost"
  | "ludumdare"
  | "alakajam"
  | "globalgamejam"
  | "cultura-pe"
  | "cva-pe";

/** Política de uso de IA declarada por la jam. */
export type AiPolicy = "allowed" | "banned" | "unknown";

/** Modalidad de participación. */
export type JamMode = "online" | "in-person" | "hybrid" | "unknown";

/** Política de participación en solitario / equipo. */
export type TeamPolicy = "solo" | "team" | "both";

/** Organizador/host de la jam. */
export interface JamHost {
  name: string;
  url?: string;
}

export interface Jam {
  /** Fuente de origen (ID canónico). */
  source: JamSource;
  /** ID estable dentro de la fuente. */
  sourceId: string;
  /** URL pública de la jam en su fuente. */
  url: string;
  title: string;
  hosts: JamHost[];
  /** Inicio (ISO 8601) o null si sólo hay deadline. */
  startAt: string | null;
  /** Fin / deadline (ISO 8601) o null. */
  endAt: string | null;
  /** Duración en días, o null. */
  durationDays: number | null;
  /** Tema de la jam, o null si aún no se conoce. */
  theme: string | null;
  tags: string[];
  /** Códigos de idioma admitidos, p. ej. ["es", "en"]. */
  languages: string[];
  /** ¿Reparte premios? null = desconocido. */
  hasPrize: boolean | null;
  /** Resumen del premio para mostrar, p. ej. "$10.000 USD · +créditos". */
  prizeSummary: string | null;
  /** Valor del premio normalizado a USD (para ordenar), o null. */
  prizeValueUsd: number | null;
  aiPolicy: AiPolicy;
  mode: JamMode;
  /** Nº de participantes, o null. */
  participants: number | null;
  /** País (ISO-3166 alpha-2) cuando aplica, o null. */
  country: string | null;
  /** ¿Tiene ranking/valoración? null = desconocido. */
  ranked: boolean | null;
  /** Destacada por el equipo. */
  featured: boolean;
  /** Confianza del enriquecimiento automático (0..1). */
  enrichmentConfidence: number;
  /**
   * Versión de las heurísticas con las que se enriqueció. Permite invalidar el
   * caché (reprocesar el detalle una vez) cuando se mejoran las reglas. Opcional:
   * los adapters no la fijan; la estampa `enrichHeuristics`.
   */
  enrichmentVersion?: number;
  /**
   * Auditoría legible de qué señal disparó cada decisión (premio/IA/idioma), p.ej.
   * "ia=banned←'no ai'; premio=cash $5000←'$5,000'". Opcional; sólo para depurar.
   */
  enrichmentSignals?: string | null;
  /** Motor/tecnología detectado (godot, unity, unreal, …) o null. */
  engine?: string | null;
  /** Política solo/equipo detectada, o null si no hay señal. */
  teamPolicy?: TeamPolicy | null;
}
