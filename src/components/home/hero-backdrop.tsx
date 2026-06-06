/**
 * Fondo cinematográfico del hero.
 *
 * Capas (de atrás a delante):
 *  1. Slot de video — listo para un loop de gameplay (ver TODO).
 *  2. Gradient mesh animado (3 blobs violeta a la deriva, CSS puro).
 *  3. Viñeta radial para enfocar el centro.
 *  4. Grano (se aplica con la clase `grain` en la sección padre).
 *  5. Partículas violeta flotantes.
 *
 * Todo el movimiento se congela con prefers-reduced-motion (manejado en globals.css).
 *
 * TODO (cuando haya video): sustituir el bloque comentado por:
 *   <video autoPlay muted loop playsInline poster="/hero/poster.jpg"
 *          className="absolute inset-0 h-full w-full object-cover opacity-40">
 *     <source src="/hero/loop.webm" type="video/webm" />
 *     <source src="/hero/loop.mp4" type="video/mp4" />
 *   </video>
 * y bajar la opacidad de los blobs.
 */

// Posiciones deterministas (evitan mismatch de hidratación).
const PARTICLES = [
  { left: "12%", top: "28%", size: 6, dur: "7s", delay: "0s" },
  { left: "22%", top: "62%", size: 4, dur: "9s", delay: "1.2s" },
  { left: "35%", top: "18%", size: 5, dur: "8s", delay: "0.6s" },
  { left: "48%", top: "72%", size: 3, dur: "10s", delay: "2s" },
  { left: "58%", top: "32%", size: 7, dur: "7.5s", delay: "0.3s" },
  { left: "68%", top: "58%", size: 4, dur: "9.5s", delay: "1.6s" },
  { left: "78%", top: "24%", size: 5, dur: "8.5s", delay: "0.9s" },
  { left: "86%", top: "66%", size: 6, dur: "7s", delay: "2.4s" },
  { left: "16%", top: "44%", size: 3, dur: "11s", delay: "1s" },
  { left: "90%", top: "40%", size: 4, dur: "8s", delay: "0.4s" },
] as const;

export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--bg)]" aria-hidden>
      {/* 1. Slot de video (placeholder cinematográfico hasta tener el loop) */}

      {/* 2. Gradient mesh */}
      <div
        className="mesh-blob mesh-a"
        style={{
          width: "55vw",
          height: "55vw",
          left: "-10%",
          top: "-15%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0) 70%)",
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
            "radial-gradient(circle, rgba(109,74,214,0.45) 0%, rgba(109,74,214,0) 70%)",
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
            "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(167,139,250,0) 70%)",
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

      {/* 5. Partículas */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              "--p-dur": p.dur,
              "--p-delay": p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
