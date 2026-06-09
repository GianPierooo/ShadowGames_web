import { ImageResponse } from "next/og";
import { getGameBySlug, GAMES } from "@/lib/games";

/**
 * OG image por juego.
 *
 * Usa el accentColor del juego SOLO como glow puntual (igual que en la
 * página de detalle): la marca violeta sigue dominando el frame. Sin
 * fuentes custom (build robusto); el peso lo da el layout.
 */
export const alt = "Shadow Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export default async function GameOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  const title = game?.title.es ?? "Shadow Games";
  const tagline = game?.tagline.es ?? "Donde la penumbra cobra vida.";
  const accent = game?.accentColor ?? "#8b5cf6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: `radial-gradient(55% 75% at 80% 15%, ${accent}40 0%, rgba(14,12,22,0) 60%), linear-gradient(135deg, #0e0c16 0%, #181534 100%)`,
          color: "#f5f3ef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#a78bfa",
          }}
        >
          Shadow Games
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 18 ? 84 : 104,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 34,
              fontStyle: "italic",
              color: "#b4b0c7",
              maxWidth: 980,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#7a779a",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 40,
              height: 6,
              background: accent,
              borderRadius: 999,
            }}
          />
          shadowgames.studio
        </div>
      </div>
    ),
    { ...size },
  );
}
