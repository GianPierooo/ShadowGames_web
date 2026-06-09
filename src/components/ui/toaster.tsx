"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toaster del estudio (Sonner) con el estilo de marca.
 *
 * Se monta SOLO en las rutas que disparan toasts (hoy /contacto), no en el
 * layout global — así Sonner no entra en el bundle del resto de páginas.
 */
export function Toaster() {
  return (
    <SonnerToaster
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
  );
}
