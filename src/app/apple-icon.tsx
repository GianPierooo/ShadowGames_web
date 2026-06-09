import { ImageResponse } from "next/og";

/**
 * Apple touch icon (180×180) generado con next/og.
 *
 * iOS requiere PNG sin transparencia, así que lo rasterizamos desde el
 * placeholder de marca actual (la "S" violeta sobre fondo OLED). El SVG
 * `icon.svg` cubre el favicon; este cubre el touch icon de Apple.
 *
 * // TODO: regenerar cuando llegue el logo SVG definitivo (basta con
 * actualizar este layout para que coincida con el nuevo mark).
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0c16",
          color: "#8b5cf6",
          fontFamily: "Georgia, serif",
          fontSize: 132,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
