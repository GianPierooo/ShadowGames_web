import { z } from "zod";

/**
 * Schema de validación del formulario de contacto.
 *
 * Single source of truth: lo importa el formulario cliente
 * (react-hook-form + zodResolver) y la Server Action
 * `sendContactEmail` (defensa en profundidad).
 *
 * Los mensajes de error son claves de i18n (`Contact.errorXxx`) que
 * cada consumidor resuelve con `useTranslations` / `getTranslations`.
 * Así el schema queda libre de strings concretos y reusable.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "errorNameMin"),
  email: z.string().trim().email("errorEmailFormat"),
  subject: z.string().trim().min(3, "errorSubjectMin"),
  message: z
    .string()
    .trim()
    .min(20, "errorMessageMin")
    .max(4000, "errorMessageMax"),
  /** Honeypot. Tiene que llegar vacío. Si llega lleno → bot. */
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Resultado discriminado del Server Action. */
export type ContactResult =
  | { ok: true }
  | { ok: false; kind: "validation"; errors: Record<string, string> }
  | { ok: false; kind: "rate_limited" }
  | { ok: false; kind: "not_configured" }
  | { ok: false; kind: "send_failed" };
