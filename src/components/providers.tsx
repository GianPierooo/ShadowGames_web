"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers globales del cliente.
 * - next-themes con dark por defecto y respeto de prefers-color-scheme
 * - MotionConfig reducedMotion="user": respeta prefers-reduced-motion del SO
 *   desactivando transform/layout pero conservando fades de opacidad. Clave:
 *   evita ramificar el JSX por reduced-motion (eso provoca hydration mismatch).
 * - Sonner para toasts (notificaciones de forms, etc.)
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
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </NextThemeProvider>
  );
}
