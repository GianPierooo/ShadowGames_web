import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SOCIAL } from "@/lib/social";
import { ContactForm } from "@/components/contact/contact-form";
import { Toaster } from "@/components/ui/toaster";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const STUDIO_EMAIL = "shadowgames.devteam@gmail.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: routeAlternates("/contacto"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/es/contacto",
    },
  };
}

/**
 * /contacto — Formulario + canales directos.
 *
 * Override de MASTER.md en `design-system/shadow-games-studio/pages/contacto.md`.
 *
 * Layout dos columnas (1.5fr / 1fr) en desktop, una columna en mobile.
 * Gap generoso, sin divider visual. Sin mapa, sin horarios, sin FAQ.
 *
 * El formulario es client component (`<ContactForm>`); el resto es server.
 */
export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-6xl px-6 section-top pb-24 md:pb-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        {/* Columna izquierda — Header + formulario ─────────────────── */}
        <section aria-labelledby="contact-title">
          <header className="mb-12">
            <p className="mb-5 text-xs uppercase tracking-[0.25em] text-[var(--text-subtle)]">
              {t("eyebrow")}
            </p>
            <h1
              id="contact-title"
              tabIndex={-1}
              className="font-display font-bold leading-[1.05] tracking-tight text-balance text-[var(--text)] focus:outline-none"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
            >
              {t("title")}
            </h1>
            <p className="mt-5 max-w-prose text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
              {t("subtitle")}
            </p>
          </header>
          <ContactForm />
        </section>

        {/* Columna derecha — Canales directos ─────────────────────── */}
        <aside aria-labelledby="channels-heading" className="lg:pt-16">
          <h2
            id="channels-heading"
            className="mb-6 font-display text-xl font-bold text-[var(--text)]"
          >
            {t("channelsHeading")}
          </h2>
          {/* Ritmo editorial: cada canal es una fila con hairline (divide-y),
              padding homogéneo aplicado a los <li> hijos (el email inline y los
              <ChannelLink>). La columna se lee como panel compuesto, no lista
              suelta. */}
          <ul
            className="divide-y divide-[var(--border)] border-t border-[var(--border)] text-base [&>li]:py-4 [&>li:first-child]:pt-5"
            role="list"
          >
            <li>
              <span className="block text-sm text-[var(--text-muted)]">
                {t("channelEmail")}
              </span>
              <a
                href={`mailto:${STUDIO_EMAIL}`}
                className="cursor-pointer text-[var(--text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                {STUDIO_EMAIL}
              </a>
            </li>
            <ChannelLink label={t("channelDiscord")} href={SOCIAL.discord} />
            <ChannelLink label={t("channelTwitter")} href={SOCIAL.x} />
          </ul>
        </aside>
      </div>

      {/* Toaster montado solo aquí: Sonner no entra en el bundle del resto. */}
      <Toaster />
    </div>
  );
}

/**
 * Canal externo. Si el href es "#" (placeholder fase 1) lo renderiza
 * como texto deshabilitado — visible pero no clickeable, sin enlace
 * roto. PRINCIPLES: cero "Próximamente" decorativo; aquí el dato
 * (el handle/nombre) ya es la información, el link llegará después.
 */
function ChannelLink({ label, href }: { label: string; href: string }) {
  const disabled = href === "#";
  return (
    <li>
      <span className="block text-sm text-[var(--text-muted)]">{label}</span>
      {disabled ? (
        <span
          aria-disabled
          className="cursor-default select-none text-[var(--text-subtle)]"
        >
          —
        </span>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-[var(--text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {href}
        </a>
      )}
    </li>
  );
}
