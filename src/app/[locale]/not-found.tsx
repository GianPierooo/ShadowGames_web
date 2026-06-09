import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * 404 dentro del bracket [locale] — el sitio entero está localizado y
 * preferimos resolver el copy desde i18n, no hardcodear en inglés.
 *
 * Minimalismo: fullscreen, centrado, un único CTA como link de texto
 * (no botón sólido — PRINCIPLES: una sola acción primaria y aquí ni
 * siquiera es prioritaria).
 */
export default async function NotFoundPage() {
  const t = await getTranslations("NotFound");
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">
          {t("code")}
        </p>
        <h1
          className="font-display font-bold leading-[1.05] tracking-tight text-balance text-[var(--text)]"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
          {t("body")}
        </p>
        <div className="mt-10">
          <Link
            href={{ pathname: "/" }}
            className="group inline-flex cursor-pointer items-center gap-2 text-base text-[var(--text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {t("cta")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </main>
  );
}
