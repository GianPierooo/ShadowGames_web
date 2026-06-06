import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getFeaturedGames } from "@/lib/games";
import { GameCard } from "@/components/home/game-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export async function FeaturedGames() {
  const t = await getTranslations("Home");
  const tStatus = await getTranslations("Status");
  const games = getFeaturedGames().slice(0, 6);

  return (
    <section className="relative px-6 py-24 md:py-32" aria-labelledby="games-heading">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <header className="mb-12 flex flex-col gap-3 md:mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
              {t("gamesSubtitle")}
            </p>
            <h2
              id="games-heading"
              className="font-display text-4xl font-bold tracking-tight md:text-6xl"
            >
              {t("gamesTitle")}
            </h2>
          </header>
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, i) => (
            <Reveal as="li" key={game.slug} delay={(i % 3) * 0.08}>
              <GameCard game={game} statusLabel={tStatus(game.status)} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <div className="mt-12 flex justify-center md:mt-16">
            <Button asChild size="lg" variant="outline">
              <Link href="/juegos">
                {t("gamesViewAll")}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
