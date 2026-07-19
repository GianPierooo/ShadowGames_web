import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  experimental: {
    // Fase 7: transiciones de ruta nativas (React <ViewTransition>). Las
    // navegaciones de App Router son Transiciones de React, así que animan
    // solas; peso cero (API del navegador) y degradación elegante sin soporte.
    viewTransition: true,
  },
};

export default withNextIntl(nextConfig);
