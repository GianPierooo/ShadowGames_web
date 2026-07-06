/**
 * Migraciones idempotentes del schema `radar` (no hay ORM: SQL directo).
 * Ejecutar:  SUPABASE_ACCESS_TOKEN=sbp_... npm run migrate
 * (o pon SUPABASE_ACCESS_TOKEN en .env.local, que está gitignored).
 *
 * OJO permisos: la app se conecta con un rol de MÍNIMO PRIVILEGIO (radar_ingest,
 * solo DML) que NO es dueño de la tabla → no puede ALTER. Por eso las migraciones
 * (DDL) van por la Management API de Supabase (rol admin), no por DATABASE_URL.
 * El token de acceso NUNCA se escribe en el repo; se lee de env.
 *
 * Todas las sentencias deben ser seguras de re-correr (IF NOT EXISTS).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

/** Deriva el project ref de SUPABASE_PROJECT_REF o del usuario del DATABASE_URL (role.REF). */
function projectRef(): string {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;
  const url = process.env.DATABASE_URL;
  if (url) {
    const user = decodeURIComponent(new URL(url).username);
    const parts = user.split(".");
    if (parts.length === 2 && parts[1]) return parts[1];
  }
  throw new Error(
    "No pude derivar el project ref. Define SUPABASE_PROJECT_REF (o usa un DATABASE_URL de pooler tipo role.REF).",
  );
}

/** Ejecuta SQL contra la Management API; devuelve las filas (JSON). */
async function runSql(ref: string, token: string, query: string): Promise<unknown[]> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? (JSON.parse(text) as unknown[]) : [];
}

/** DDL idempotente a aplicar (en orden). */
const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: "reminded_at (recordatorio cierra-pronto, carril separado de notified_at)",
    sql: "alter table radar.jams add column if not exists reminded_at timestamptz;",
  },
];

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Falta SUPABASE_ACCESS_TOKEN (token de la Management API). Ejecuta: SUPABASE_ACCESS_TOKEN=sbp_... npm run migrate",
    );
  }
  const ref = projectRef();
  console.log(`=== migrate → schema radar.jams (project ${ref}) ===`);

  for (const m of MIGRATIONS) {
    await runSql(ref, token, m.sql);
    console.log(`✓ ${m.name}`);
  }

  // Verificación por information_schema.
  const cols = await runSql(
    ref,
    token,
    "select column_name, data_type, is_nullable from information_schema.columns " +
      "where table_schema='radar' and table_name='jams' and column_name='reminded_at';",
  );
  console.log("information_schema.columns →", JSON.stringify(cols));
  if (cols.length !== 1) {
    throw new Error("reminded_at NO aparece en information_schema tras la migración");
  }
  console.log("✅ migración confirmada.");
}

main().catch((err) => {
  console.error("migrate falló:", err instanceof Error ? err.message : err);
  process.exit(1);
});
