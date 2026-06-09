import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SOCIAL } from "@/lib/social";
import { ContactForm } from "@/components/contact/contact-form";

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
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
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
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
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
          <ul className="space-y-4 text-base" role="list">
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
            <li>
              <span className="block text-sm text-[var(--text-muted)]">
                {t("channelPress")}
              </span>
              <Link
                href={{ pathname: "/press" }}
                className="cursor-pointer text-[var(--text)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                /press
              </Link>
            </li>
          </ul>
        </aside>
      </div>
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
