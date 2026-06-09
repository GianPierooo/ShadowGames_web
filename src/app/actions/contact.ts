"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { contactSchema, type ContactResult } from "@/lib/contact-schema";

/**
 * Server Action: envía un mensaje de contacto al estudio vía Resend.
 *
 * Flujo:
 *  1. Re-valida el payload con el mismo zod schema del cliente.
 *  2. Honeypot lleno → finge éxito silenciosamente (no avisa al bot).
 *  3. Rate-limit por IP (in-memory, 5 envíos / 10 min). TODO: migrar
 *     a Upstash Redis cuando el tráfico justifique persistencia.
 *  4. Si `RESEND_API_KEY` no está definida → `not_configured`.
 *  5. Envía y devuelve `{ ok: true }` o `{ ok: false, kind: ... }`.
 *
 * Los mensajes legibles los pone el cliente desde i18n; aquí solo
 * mandamos discriminadores.
 */

const RATE_WINDOW_MS = 10 * 60 * 1_000;
const RATE_MAX = 5;

/** Map IP → timestamps de envíos dentro de la ventana. */
const recentByIp = new Map<string, number[]>();

/** Limpia entradas viejas (LRU naive). Llamado en cada submit. */
function pruneRateBucket(ip: string, now: number): number[] {
  const list = (recentByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (list.length === 0) recentByIp.delete(ip);
  else recentByIp.set(ip, list);
  return list;
}

async function readClientIp(): Promise<string> {
  const h = await headers();
  // Vercel / la mayoría de proxies ponen una de estas.
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "anonymous"
  );
}

export async function sendContactEmail(
  formData: FormData,
): Promise<ContactResult> {
  // 1. Parse + valida
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, kind: "validation", errors };
  }

  // 2. Honeypot: bot detectado, finge éxito.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true };
  }

  // 3. Rate-limit por IP
  const ip = await readClientIp();
  const now = Date.now();
  const recent = pruneRateBucket(ip, now);
  if (recent.length >= RATE_MAX) {
    return { ok: false, kind: "rate_limited" };
  }
  recent.push(now);
  recentByIp.set(ip, recent);

  // 4. Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, kind: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { name, email, subject, message } = parsed.data;
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Shadow Games <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL ?? "shadowgames.devteam@gmail.com"],
      replyTo: email,
      subject: `[Web] ${subject}`,
      text: `De: ${name} <${email}>\n\n${message}`,
    });
    return { ok: true };
  } catch (err) {
    console.error("[contact] Resend send failed", err);
    return { ok: false, kind: "send_failed" };
  }
}
