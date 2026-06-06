import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { FeaturedGames } from "@/components/home/featured-games";
import { StudioSection } from "@/components/home/studio-section";
import { MerchSection } from "@/components/home/merch-section";
import { CommunityBanner } from "@/components/home/community-banner";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeaturedGames />
      <StudioSection />
      <MerchSection />
      <CommunityBanner />
    </>
  );
}
