// NOTA: revisar con abogado antes de producción real.
// El contenido en Legal.privacyP*Heading/Body es un placeholder
// realista pero no sustituye asesoramiento jurídico.

import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { routeAlternates } from "@/lib/site";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const LAST_UPDATED = "2026-06-08";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");
  return {
    title: t("privacyTitle"),
    alternates: routeAlternates("/privacidad"),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Legal");

  const sections = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    heading: t(`privacyP${n}Heading` as const),
    body: t(`privacyP${n}Body` as const),
  }));

  return (
    <LegalPage
      eyebrow={t("eyebrow")}
      title={t("privacyTitle")}
      lastUpdatedLabel={t("lastUpdated")}
      lastUpdated={LAST_UPDATED}
      sections={sections}
    />
  );
}
