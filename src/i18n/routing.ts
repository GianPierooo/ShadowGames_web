import { defineRouting } from "next-intl/routing";

/**
 * Configuración de routing i18n.
 *
 * Fase 1 (actual): solo español. Las rutas viven en /es/*.
 * Para añadir inglés en el futuro: agregar "en" a `locales` y los pathnames
 * en inglés en `pathnames`. Todo el resto del código ya está preparado.
 */
export const routing = defineRouting({
  locales: ["es"] as const,
  defaultLocale: "es",
  localePrefix: "always",

  // Segmentos localizados — cuando se añada EN, agregar las traducciones aquí
  pathnames: {
    "/": "/",
    "/juegos": {
      es: "/juegos",
    },
    "/juegos/[slug]": {
      es: "/juegos/[slug]",
    },
    "/contribuciones": {
      es: "/contribuciones",
    },
    "/jams": {
      es: "/jams",
    },
    "/estudio": {
      es: "/estudio",
    },
    "/contacto": {
      es: "/contacto",
    },
    "/privacidad": {
      es: "/privacidad",
    },
    "/aviso-legal": {
      es: "/aviso-legal",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
