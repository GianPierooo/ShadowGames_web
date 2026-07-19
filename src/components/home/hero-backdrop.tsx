/**
 * Fondo cinematográfico del hero.
 *
 * Capas (de atrás a delante):
 *  1. Video loop de gameplay (HeroVideo) + scrim para legibilidad del texto.
 *  2. Gradient mesh animado (3 blobs violeta a la deriva, CSS puro).
 *  3. Viñeta radial para enfocar el centro (funde los bordes → oculta el HUD
 *     del gameplay en las esquinas).
 *  4. Grano (se aplica con la clase `grain` en la sección padre).
 *
 * Todo el movimiento se congela con prefers-reduced-motion (manejado en
 * globals.css y, para el video, dentro de HeroVideo).
 */

import { HeroVideo } from "@/components/home/hero-video";

export function HeroBackdrop() {
  return (
    // Extendido en vertical (-top/h) para que el parallax (transform en
    // `.hero-parallax`, definido en globals.css, scroll-driven CSS) no descubra
    // bordes al desplazarse. No se toca el <video>: solo el contenedor.
    <div
      className="hero-parallax absolute inset-x-0 -top-[12%] h-[124%] -z-10 overflow-hidden bg-[var(--bg)]"
      aria-hidden
    >
      {/* 1. Video de fondo + scrim. El video es dark; el scrim asegura
          contraste del h1 y unifica el fondo con la marca. */}
      <HeroVideo />
      {/* Scrim theme-aware (opacidad en globals.css): suave en dark (video
          protagonista), fuerte en light (el video oscuro queda como textura
          y el texto oscuro conserva contraste). */}
      <div className="hero-scrim absolute inset-0 bg-[var(--bg)]" />

      {/* 2. Gradient mesh (opacidad reducida: el video ya aporta textura) */}
      <div
        className="mesh-blob mesh-a"
        style={{
          width: "55vw",
          height: "55vw",
          left: "-10%",
          top: "-15%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0) 70%)",
        }}
      />
      <div
        className="mesh-blob mesh-b"
        style={{
          width: "50vw",
          height: "50vw",
          right: "-12%",
          top: "5%",
          background:
            "radial-gradient(circle, rgba(109,74,214,0.28) 0%, rgba(109,74,214,0) 70%)",
        }}
      />
      <div
        className="mesh-blob mesh-c"
        style={{
          width: "45vw",
          height: "45vw",
          left: "25%",
          bottom: "-25%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.22) 0%, rgba(167,139,250,0) 70%)",
        }}
      />

      {/* 3. Viñeta radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
