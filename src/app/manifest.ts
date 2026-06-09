import type { MetadataRoute } from "next";

/**
 * Web App Manifest.
 *
 * Iconos: el SVG de marca (escalable) sirve para todos los tamaños.
 * // TODO: cuando llegue el logo definitivo, añadir PNGs 192/512
 * (maskable) en /public/brand/ y referenciarlos aquí para una mejor
 * experiencia de "Añadir a pantalla de inicio".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shadow Games",
    short_name: "Shadow Games",
    description: "Estudio indie de videojuegos. Mundos con sombra, hechos a mano.",
    start_url: "/es",
    display: "standalone",
    background_color: "#0e0c16",
    theme_color: "#0e0c16",
    lang: "es",
    icons: [
      {
        src: "/brand/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
