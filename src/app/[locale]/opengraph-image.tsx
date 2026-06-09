import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

/**
 * OG image genérica (home + rutas que no definen la suya).
 *
 * Render con next/og (satori). Sin fuentes custom: usamos la fuente por
 * defecto de ImageResponse para que el build sea robusto sin depender de
 * descargar Fraunces. El peso de marca lo da el color y el layout.
 *
 * TODO (opcional): incrustar bytes de Fraunces para el título cuando se
 * quiera fidelidad tipográfica total en las tarjetas sociales.
 */
export const alt = "Shadow Games — Donde la penumbra cobra vida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(60% 80% at 25% 25%, #2a1a5e 0%, rgba(42,26,94,0) 60%), linear-gradient(135deg, #0e0c16 0%, #181534 100%)",
          color: "#f5f3ef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#a78bfa",
          }}
        >
          Mundos con sombra, hechos a mano
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          <span>SHADOW</span>
          <span style={{ color: "#8b5cf6" }}>GAMES</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 36,
            fontStyle: "italic",
            color: "#b4b0c7",
          }}
        >
          Donde la penumbra cobra vida.
        </div>
      </div>
    ),
    { ...size },
  );
}
