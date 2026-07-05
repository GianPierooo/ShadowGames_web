import { z } from "zod";
import type { Jam } from "./types";

/**
 * Validación de runtime del modelo `Jam` (los datos vienen de scraping/APIs
 * externas, así que no confiamos en su forma). El tipo estático sigue en
 * `types.ts`; aquí sólo añadimos la verificación en runtime con zod.
 *
 * Usamos refinamientos en vez de `.url()/.datetime()` para no depender de
 * diferencias de API entre versiones de zod.
 */
const isoDateTime = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "fecha ISO inválida");

const httpUrl = z
  .string()
  .refine((s) => /^https?:\/\//i.test(s), "URL http(s) inválida");

export const JamHostSchema = z.object({
  name: z.string().min(1),
  url: httpUrl.optional(),
});

export const JamSchema = z.object({
  source: z.enum([
    "itch",
    "devpost",
    "ludumdare",
    "alakajam",
    "globalgamejam",
    "cultura-pe",
    "cva-pe",
  ]),
  sourceId: z.string().min(1),
  url: httpUrl,
  title: z.string().min(1),
  hosts: z.array(JamHostSchema),
  startAt: isoDateTime.nullable(),
  endAt: isoDateTime.nullable(),
  durationDays: z.number().nullable(),
  theme: z.string().nullable(),
  tags: z.array(z.string()),
  languages: z.array(z.string()),
  hasPrize: z.boolean().nullable(),
  prizeSummary: z.string().nullable(),
  prizeValueUsd: z.number().nullable(),
  aiPolicy: z.enum(["allowed", "banned", "unknown"]),
  mode: z.enum(["online", "in-person", "hybrid", "unknown"]),
  participants: z.number().nullable(),
  country: z.string().nullable(),
  ranked: z.boolean().nullable(),
  featured: z.boolean(),
  enrichmentConfidence: z.number().min(0).max(1),
  enrichmentVersion: z.number().optional(),
  enrichmentSignals: z.string().nullable().optional(),
});

export type JamFromSchema = z.infer<typeof JamSchema>;

// Aserción en tiempo de compilación: schema y tipo `Jam` son mutuamente
// asignables (si uno deriva del otro, tsc falla aquí).
const _schemaMatchesType: Jam = {} as JamFromSchema;
const _typeMatchesSchema: JamFromSchema = {} as Jam;
void _schemaMatchesType;
void _typeMatchesSchema;

/** Valida una lista, separando válidas de inválidas (con el motivo). */
export function validateJams(jams: unknown[]): {
  valid: Jam[];
  invalid: { index: number; error: string; title?: string }[];
} {
  const valid: Jam[] = [];
  const invalid: { index: number; error: string; title?: string }[] = [];
  jams.forEach((j, index) => {
    const res = JamSchema.safeParse(j);
    if (res.success) {
      valid.push(res.data);
    } else {
      const title =
        j && typeof j === "object" && "title" in j
          ? String((j as { title: unknown }).title)
          : undefined;
      invalid.push({
        index,
        title,
        error: res.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
    }
  });
  return { valid, invalid };
}
