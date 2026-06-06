/**
 * URLs de redes sociales y comunidad.
 *
 * Placeholders por ahora — reemplazar con las URLs reales antes del lanzamiento.
 * Convención: si el href es "#", la UI puede mostrar el ítem deshabilitado o
 * ocultarlo. Cuando estén las URLs reales, sustituir aquí y no en componentes.
 */
export const SOCIAL = {
  discord: "#",
  x: "#",
  youtube: "#",
  instagram: "#",
  bluesky: "#",
} as const;

export type SocialKey = keyof typeof SOCIAL;

/** Etiquetas legibles para accesibilidad y tooltips. */
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  discord: "Discord",
  x: "X / Twitter",
  youtube: "YouTube",
  instagram: "Instagram",
  bluesky: "Bluesky",
};
