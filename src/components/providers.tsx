"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers globales del cliente.
 * - next-themes con dark por defecto y respeto de prefers-color-scheme
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
      {children}
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
