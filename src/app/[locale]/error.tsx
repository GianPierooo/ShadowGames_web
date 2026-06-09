"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * Error boundary localizado.
 *
 * Skill (`search.py "error pages 404 personality" --domain ux`):
 *  - `role="alert"` para anunciar el error a screen readers.
 *  - Proveer ruta de recuperación clara — aquí Reintentar + Volver al
 *    inicio.
 *  - Mensaje claro cerca del problema (este es el problema entero).
 *
 * En desarrollo, mostramos `error.message` + `error.digest` colapsado
 * en un `<details>` para ayudar a depurar. En producción, el bloque no
 * se renderiza (PRINCIPLES: cero chrome inútil).
 */
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Error");

  useEffect(() => {
    // Hook reservado para enviar a un sink de errores en H3.
    console.error("[error.tsx]", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-2xl text-center" role="alert">
        <h1
          className="font-display font-bold leading-[1.05] tracking-tight text-balance text-[var(--text)]"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
          {t("body")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Button onClick={reset} variant="outline" size="lg">
            <RotateCcw className="size-4" />
            {t("retry")}
          </Button>
          <Link
            href={{ pathname: "/" }}
            className="group inline-flex cursor-pointer items-center gap-2 text-base text-[var(--text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {t("home")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isDev && (
          <details className="mt-12 text-left">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-[var(--text-subtle)]">
              {t("devDetails")}
            </summary>
            <pre className="mt-3 overflow-x-auto rounded-[var(--radius-card)] bg-[var(--surface)] p-4 font-mono text-xs text-[var(--text-muted)]">
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ""}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
