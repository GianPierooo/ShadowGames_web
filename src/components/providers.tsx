"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers globales del cliente.
 * - next-themes con dark por defecto y respeto de prefers-color-scheme.
 *
 * Nota de rendimiento: ya NO montamos aquí MotionConfig ni el Toaster de
 * Sonner. Las animaciones de entrada son CSS puro (hero) o
 * IntersectionObserver + CSS (<Reveal>), así que la librería Motion sale del
 * bundle de todas las rutas. El Toaster se monta solo en /contacto.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark"]}
    >
      {children}
    </NextThemeProvider>
  );
}
