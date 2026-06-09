import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { routing } from "@/i18n/routing";
import { SOCIAL } from "@/lib/social";
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME } from "@/lib/site";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0c16" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://shadowgames.studio"),
  title: {
    default: "Shadow Games — Donde la penumbra cobra vida",
    template: "%s · Shadow Games",
  },
  description:
    "Estudio indie de videojuegos. Mundos con sombra, hechos a mano. Acción, atmósfera y narrativa cinematográfica.",
  applicationName: "Shadow Games",
  keywords: ["videojuegos indie", "estudio indie", "Shadow Games", "indie games"],
  authors: [{ name: "Shadow Games Studio" }],
  creator: "Shadow Games Studio",
  publisher: "Shadow Games Studio",
  openGraph: {
    type: "website",
    siteName: "Shadow Games",
    title: "Shadow Games — Donde la penumbra cobra vida",
    description:
      "Estudio indie de videojuegos. Mundos con sombra, hechos a mano.",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadow Games",
    description: "Estudio indie de videojuegos. Mundos con sombra, hechos a mano.",
  },
  // Favicons y apple-touch-icon se resuelven por convención de archivos
  // (src/app/icon.svg + src/app/apple-icon.tsx). El manifest vía manifest.ts.
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita renderizado estático para esta locale (next-intl).
  setRequestLocale(locale);
  const t = await getTranslations("A11y");

  // JSON-LD Organization (global). `sameAs` solo incluye URLs reales:
  // los placeholders "#" se filtran para no emitir datos inválidos.
  // TODO: cuando lleguen las URLs sociales reales (src/lib/social.ts),
  // aparecerán automáticamente aquí.
  const sameAs = Object.values(SOCIAL).filter((url) => url !== "#");
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_LEGAL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.svg`,
    description:
      "Estudio indie de videojuegos. Mundos con sombra, hechos a mano.",
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <html lang={locale} suppressHydrationWarning className={`${fraunces.variable} ${interTight.variable}`}>
      <body>
        {/* Sin JS, los bloques <Reveal> no recibirían .is-visible: forzamos
            su visibilidad para no ocultar contenido (progressive enhancement). */}
        <noscript>
          <style>{".reveal{opacity:1 !important;transform:none !important}"}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider>
          <Providers>
            <a
              href="#contenido"
              className="sr-only rounded-[var(--radius-pill)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-[var(--accent-deep)] focus:px-5 focus:py-3 focus:font-medium focus:text-white focus:shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {t("skipToContent")}
            </a>
            <Header />
            <main id="contenido">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
