import postgres from "postgres";
import type { AiPolicy, Jam, JamHost, JamMode, JamSource } from "./types";
import type { JamSort } from "./filters";

/**
 * Acceso a Postgres (Supabase) con postgres.js y SQL directo parametrizado.
 * No usamos supabase-js: sólo queremos SQL, no la capa REST.
 *
 * Las tablas del Radar viven en el schema "radar" (public queda libre para la
 * web). Todas las queries usan el nombre calificado `radar.jams` — robusto con
 * el pooler en modo transaction, sin depender del search_path.
 *
 * Singleton cacheado en globalThis para no abrir múltiples conexiones en
 * serverless (cada invocación reusa la misma instancia).
 */
type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __radarSql?: Sql };

export function getSql(): Sql {
  if (globalForDb.__radarSql) return globalForDb.__radarSql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está configurada (connection string del pooler de Supabase).",
    );
  }

  const sql = postgres(url, {
    // Supabase exige SSL.
    ssl: "require",
    // El pooler en modo transaction (pgbouncer) NO soporta prepared statements.
    prepare: false,
    // Pocas conexiones: es un cron/ingesta, no una app de alta concurrencia.
    max: 3,
  });

  globalForDb.__radarSql = sql;
  return sql;
}

// ---------------------------------------------------------------------------
// Upsert
// ---------------------------------------------------------------------------

/**
 * Inserta/actualiza jams por (source, source_id). Parametrizado (sin inyección).
 * hosts y raw van como jsonb; tags y languages como arrays Postgres.
 * Devuelve el número de jams procesadas.
 */
export async function upsertJams(jams: Jam[]): Promise<number> {
  if (jams.length === 0) return 0;
  const sql = getSql();

  await sql.begin(async (tx) => {
    // El tipo JSONValue de postgres.js es estricto; nuestros datos son
    // JSON-serializables (hosts: JamHost[], raw: Jam). Cast acotado y seguro.
    const toJson = (v: unknown) => tx.json(v as Parameters<typeof tx.json>[0]);
    for (const j of jams) {
      await tx`
        insert into radar.jams (
          source, source_id, url, title, hosts,
          start_at, end_at, duration_days, theme, tags, languages,
          has_prize, prize_summary, prize_value_usd, ai_policy, mode,
          participants, country, ranked, featured, enrichment_confidence,
          enrichment_version, enrichment_signals, raw
        ) values (
          ${j.source}, ${j.sourceId}, ${j.url}, ${j.title}, ${toJson(j.hosts)},
          ${j.startAt}, ${j.endAt}, ${j.durationDays}, ${j.theme}, ${j.tags}::text[], ${j.languages}::text[],
          ${j.hasPrize}, ${j.prizeSummary}, ${j.prizeValueUsd}, ${j.aiPolicy}, ${j.mode},
          ${j.participants}, ${j.country}, ${j.ranked}, ${j.featured}, ${j.enrichmentConfidence},
          ${j.enrichmentVersion ?? 0}, ${j.enrichmentSignals ?? null}, ${toJson(j)}
        )
        on conflict (source, source_id) do update set
          url                   = excluded.url,
          title                 = excluded.title,
          hosts                 = excluded.hosts,
          start_at              = excluded.start_at,
          end_at                = excluded.end_at,
          duration_days         = excluded.duration_days,
          theme                 = excluded.theme,
          tags                  = excluded.tags,
          languages             = excluded.languages,
          has_prize             = excluded.has_prize,
          prize_summary         = excluded.prize_summary,
          prize_value_usd       = excluded.prize_value_usd,
          ai_policy             = excluded.ai_policy,
          mode                  = excluded.mode,
          participants          = excluded.participants,
          country               = excluded.country,
          ranked                = excluded.ranked,
          featured              = excluded.featured,
          enrichment_confidence = excluded.enrichment_confidence,
          enrichment_version    = excluded.enrichment_version,
          enrichment_signals    = excluded.enrichment_signals,
          raw                   = excluded.raw,
          last_seen_at          = now()
      `;
    }
  });

  return jams.length;
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export interface JamQueryFilters {
  /** Sólo jams abiertas: end_at nulo o en el futuro. */
  activeOnly?: boolean;
  hasPrize?: boolean;
  /** Código de idioma (= any(languages)). */
  language?: string;
  aiPolicy?: AiPolicy;
  mode?: JamMode;
  /** Filtra por pertenencia a un conjunto de fuentes (IN). */
  sources?: JamSource[];
  /** Búsqueda por título (ILIKE). */
  q?: string;
  /** Orden (default: deadline). */
  sort?: JamSort;
  /** Límite de filas (default 200, máx 500). */
  limit?: number;
}

interface JamRow {
  source: string;
  source_id: string;
  url: string;
  title: string;
  /** jsonb — normalmente JamHost[]; puede llegar como string en filas antiguas. */
  hosts: unknown;
  start_at: Date | null;
  end_at: Date | null;
  duration_days: number | null;
  theme: string | null;
  tags: string[] | null;
  languages: string[] | null;
  has_prize: boolean | null;
  prize_summary: string | null;
  prize_value_usd: number | null;
  ai_policy: string;
  mode: string;
  participants: number | null;
  country: string | null;
  ranked: boolean | null;
  featured: boolean;
  enrichment_confidence: number;
}

/**
 * Consulta filtrada, parametrizada. Orden: featured primero, luego start_at
 * ascendente (nulls al final). Devuelve Jam[] (snake_case → camelCase).
 */
export async function queryJams(filters: JamQueryFilters = {}): Promise<Jam[]> {
  const sql = getSql();
  const limit = Math.min(500, Math.max(1, filters.limit ?? 200));

  const conds: ReturnType<Sql>[] = [];
  if (filters.activeOnly) conds.push(sql`(end_at is null or end_at >= now())`);
  if (filters.hasPrize != null) conds.push(sql`has_prize = ${filters.hasPrize}`);
  if (filters.language) conds.push(sql`${filters.language} = any(languages)`);
  if (filters.aiPolicy) conds.push(sql`ai_policy = ${filters.aiPolicy}`);
  if (filters.mode) conds.push(sql`mode = ${filters.mode}`);
  if (filters.sources?.length)
    conds.push(sql`source = any(${filters.sources}::text[])`);
  if (filters.q) conds.push(sql`title ilike ${"%" + filters.q + "%"}`);

  const whereSql = conds.length
    ? sql`where ${conds.reduce((acc, cur) => sql`${acc} and ${cur}`)}`
    : sql``;

  // Orden en SQL (misma semántica que el sort en memoria de filters.ts).
  const orderSql =
    filters.sort === "premio"
      ? sql`order by prize_value_usd desc nulls last, end_at asc nulls last`
      : filters.sort === "participantes"
        ? sql`order by participants desc nulls last, end_at asc nulls last`
        : filters.sort === "reciente"
          ? sql`order by first_seen_at desc nulls last`
          : sql`order by end_at asc nulls last`; // deadline (default)

  const rows = await sql<JamRow[]>`
    select
      source, source_id, url, title, hosts,
      start_at, end_at, duration_days, theme, tags, languages,
      has_prize, prize_summary, prize_value_usd, ai_policy, mode,
      participants, country, ranked, featured, enrichment_confidence
    from radar.jams
    ${whereSql}
    ${orderSql}
    limit ${limit}
  `;

  return rows.map(mapRow);
}

/** Coerción defensiva de hosts (jsonb): array directo, string doble-codificado, o []. */
function asHosts(value: unknown): JamHost[] {
  if (Array.isArray(value)) return value as JamHost[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as JamHost[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: JamRow): Jam {
  return {
    source: row.source as JamSource,
    sourceId: row.source_id,
    url: row.url,
    title: row.title,
    hosts: asHosts(row.hosts),
    startAt: row.start_at ? row.start_at.toISOString() : null,
    endAt: row.end_at ? row.end_at.toISOString() : null,
    durationDays: row.duration_days,
    theme: row.theme,
    tags: row.tags ?? [],
    languages: row.languages ?? [],
    hasPrize: row.has_prize,
    prizeSummary: row.prize_summary,
    prizeValueUsd: row.prize_value_usd,
    aiPolicy: row.ai_policy as AiPolicy,
    mode: row.mode as JamMode,
    participants: row.participants,
    country: row.country,
    ranked: row.ranked,
    featured: row.featured,
    enrichmentConfidence: row.enrichment_confidence,
  };
}

// ---------------------------------------------------------------------------
// Cacheo del enriquecimiento (para el pass 2 / LLM)
// ---------------------------------------------------------------------------

/** Campos de enriquecimiento persistidos, por (source, source_id). */
export interface PersistedEnrichment {
  aiPolicy: AiPolicy;
  theme: string | null;
  hasPrize: boolean | null;
  prizeSummary: string | null;
  prizeValueUsd: number | null;
  languages: string[];
  enrichmentConfidence: number;
  /** Versión de heurística con la que se enriqueció (para invalidar caché). */
  enrichmentVersion: number;
  enrichmentSignals: string | null;
}

/**
 * Devuelve el enriquecimiento ya persistido, indexado por `${source}::${source_id}`.
 * El pipeline lo usa para NO re-llamar al LLM sobre jams ya bien clasificadas.
 */
export async function getPersistedEnrichment(): Promise<
  Map<string, PersistedEnrichment>
> {
  const sql = getSql();
  const rows = await sql<
    {
      source: string;
      source_id: string;
      ai_policy: string;
      theme: string | null;
      has_prize: boolean | null;
      prize_summary: string | null;
      prize_value_usd: number | null;
      languages: string[] | null;
      enrichment_confidence: number;
      enrichment_version: number;
      enrichment_signals: string | null;
    }[]
  >`
    select source, source_id, ai_policy, theme, has_prize,
           prize_summary, prize_value_usd, languages, enrichment_confidence,
           enrichment_version, enrichment_signals
    from radar.jams
  `;

  const map = new Map<string, PersistedEnrichment>();
  for (const r of rows) {
    map.set(`${r.source}::${r.source_id}`, {
      aiPolicy: r.ai_policy as AiPolicy,
      theme: r.theme,
      hasPrize: r.has_prize,
      prizeSummary: r.prize_summary,
      prizeValueUsd: r.prize_value_usd,
      languages: r.languages ?? [],
      enrichmentConfidence: r.enrichment_confidence,
      enrichmentVersion: r.enrichment_version ?? 0,
      enrichmentSignals: r.enrichment_signals,
    });
  }
  return map;
}

/** Nº de jams abiertas (para el contador de resultados de la UI). */
export async function countActiveJams(): Promise<number> {
  const sql = getSql();
  const rows = await sql<{ count: number }[]>`
    select count(*)::int as count
    from radar.jams
    where end_at is null or end_at >= now()
  `;
  return rows[0]?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Alertas (Discord) — candidatas y marcado de notificación
// ---------------------------------------------------------------------------

/**
 * Candidatas a alerta: nunca notificadas (notified_at null), abiertas, y con
 * premio O en español. Ordenadas por recién vistas primero.
 */
export async function selectAlertCandidates(limit: number): Promise<Jam[]> {
  const sql = getSql();
  const rows = await sql<JamRow[]>`
    select
      source, source_id, url, title, hosts,
      start_at, end_at, duration_days, theme, tags, languages,
      has_prize, prize_summary, prize_value_usd, ai_policy, mode,
      participants, country, ranked, featured, enrichment_confidence
    from radar.jams
    where notified_at is null
      and (end_at is null or end_at >= now())
      and (has_prize is true or 'es' = any(languages))
    order by first_seen_at desc, end_at asc nulls last
    limit ${Math.min(100, Math.max(1, limit))}
  `;
  return rows.map(mapRow);
}

/** Marca notified_at = now() para las claves dadas ("source::source_id"). Devuelve cuántas. */
export async function markNotified(keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  const sql = getSql();
  const rows = await sql`
    update radar.jams set notified_at = now()
    where notified_at is null
      and (source || '::' || source_id) = any(${keys}::text[])
    returning id
  `;
  return rows.length;
}
