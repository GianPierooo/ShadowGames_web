import type { Jam } from "./types";

/**
 * Cálculo puro del estado del deadline (sin i18n ni red).
 * La presentación (textos traducidos, formato de fecha/número) se hace en la
 * tarjeta con next-intl; aquí sólo devolvemos números y flags.
 */
export interface DeadlineInfo {
  /** El deadline ya pasó. */
  closed: boolean;
  /** Ya comenzó (startAt en el pasado) y sigue abierta: "en curso". */
  ongoing: boolean;
  /** Cierra en ≤ 24 h: urgencia (se pinta en rojo). */
  urgent: boolean;
  /** Horas restantes (≥ 0). */
  hours: number;
  /** Días restantes (redondeo hacia arriba). */
  days: number;
}

export function getDeadlineInfo(jam: Jam, now: Date): DeadlineInfo | null {
  if (!jam.endAt) return null;
  const end = Date.parse(jam.endAt);
  if (Number.isNaN(end)) return null;

  const nowMs = now.getTime();
  const ms = end - nowMs;
  const closed = ms <= 0;
  const hours = Math.max(0, ms) / 3_600_000;
  const days = Math.max(1, Math.ceil(hours / 24));

  const start = jam.startAt ? Date.parse(jam.startAt) : null;
  const ongoing = !closed && start !== null && !Number.isNaN(start) && start <= nowMs;
  const urgent = !closed && hours <= 24;

  return { closed, ongoing, urgent, hours, days };
}
