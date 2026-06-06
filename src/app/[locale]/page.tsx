import { setRequestLocale, getTranslations } from "next-intl/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Brand");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-2xl">
        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-6">
          {t("name")}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-muted)] italic">
          {t("tagline")}
        </p>
        <p className="mt-12 text-sm text-[var(--text-subtle)] uppercase tracking-widest">
          H0 OK · home real llega en H1
        </p>
      </div>
    </main>
  );
}
