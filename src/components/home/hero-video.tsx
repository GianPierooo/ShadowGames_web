"use client";

import { useEffect, useRef } from "react";

/**
 * Video de fondo del hero (loop de gameplay).
 *
 * - Se renderiza en SSR con autoPlay/muted/loop/playsInline: el navegador
 *   arranca la reproducción desde el HTML inicial, sin esperar a la hidratación.
 * - `poster` pinta el primer frame al instante → el LCP (el h1) no depende de
 *   la descarga del MP4.
 * - Respeta `prefers-reduced-motion`: si el usuario reduce animaciones, se pausa
 *   y queda el poster fijo (coherente con el resto de animaciones del sitio,
 *   congeladas por CSS en globals.css).
 *
 * Para cambiar el clip: reemplaza public/hero/loop.mp4 (H.264, sin audio,
 * ~720p, loop) y public/hero/poster.jpg (frame representativo). Nada de código.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) {
        v.pause();
      } else {
        // play() puede rechazar si el navegador aún no permite autoplay; se ignora.
        void v.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero/poster.jpg"
      aria-hidden
      tabIndex={-1}
    >
      <source src="/hero/loop.mp4" type="video/mp4" />
    </video>
  );
}
