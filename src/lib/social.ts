/**
 * URLs de redes sociales y comunidad.
 *
 * Convención: si el href es "#", la UI trata el ítem como no listo (lo oculta o
 * deshabilita, sin abrir en pestaña nueva). Cuando llegue la URL real, sustituir
 * aquí y no en componentes.
 *
 * Nota de tipado: el objeto se anota como `Record<SocialKey, string>` (en vez de
 * `as const`) a propósito. Con `as const` cada valor tendría tipo literal y las
 * comparaciones `SOCIAL.x !== "#"` de los componentes darían error TS2367
 * ("sin solapamiento") en cuanto una red tuviera URL real.
 */
export type SocialKey = "discord" | "x" | "youtube" | "instagram" | "bluesky";

export const SOCIAL: Record<SocialKey, string> = {
  discord: "https://discord.gg/vuBUd4n2p",
  x: "#",
  youtube: "#",
  instagram: "#",
  bluesky: "#",
};

/** Etiquetas legibles para accesibilidad y tooltips. */
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  discord: "Discord",
  x: "X / Twitter",
  youtube: "YouTube",
  instagram: "Instagram",
  bluesky: "Bluesky",
};
