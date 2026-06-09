import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt autogenerado.
 *
 * Permite todo el rastreo (sitio público) y apunta al sitemap.
 * Bloquea explícitamente las rutas de API/acciones internas que no aportan
 * valor de indexación.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
