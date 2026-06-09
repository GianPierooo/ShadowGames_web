import { getTranslations } from "next-intl/server";
import { SOCIAL } from "@/lib/social";
import { DiscordIcon } from "@/components/site/brand-icons";
import { SocialLinks } from "@/components/site/social-links";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Banner de comunidad — CTA principal a Discord + resto de redes.
 */
export async function CommunityBanner() {
  const t = await getTranslations("Home");
  const discordReady = SOCIAL.discord !== "#";

  return (
    <section className="cv-auto section-y relative px-6" aria-labelledby="community-heading">
      <Reveal>
        <div className="grain relative mx-auto max-w-5xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--accent)]/30 px-8 py-16 text-center md:px-16 md:py-20">
          {/* Glow de fondo */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(80% 120% at 50% 0%, var(--accent-soft) 0%, transparent 60%), linear-gradient(180deg, var(--surface), var(--bg))",
            }}
            aria-hidden
          />

          <h2
            id="community-heading"
            className="font-display text-3xl font-bold tracking-tight md:text-5xl"
          >
            {t("communityTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--text-muted)]">
            {t("communityBody")}
          </p>

          <div className="mt-10 flex flex-col items-center gap-6">
            <Button asChild size="lg" variant="solid">
              <a
                href={SOCIAL.discord}
                {...(discordReady && { target: "_blank", rel: "noopener noreferrer" })}
              >
                <DiscordIcon className="size-5" />
                {t("communityCtaDiscord")}
              </a>
            </Button>

            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">
                {t("communityCtaFollow")}
              </span>
              <SocialLinks only={["x", "youtube", "instagram", "bluesky"]} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
