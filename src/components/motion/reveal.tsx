"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos (para escalonar varios reveals). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  /** Etiqueta del elemento contenedor. */
  as?: "div" | "section" | "li" | "article";
  /**
   * Modo JERARQUÍA (Fase 2): en vez de revelar el contenedor como un bloque,
   * revela sus hijos DIRECTOS en cascada — el primero (líder) entra y los
   * secundarios le siguen escalonados. La cascada la resuelve CSS
   * (`.reveal-stagger` en globals.css); aquí solo se activa la clase.
   */
  stagger?: boolean;
}

/**
 * Revela su contenido al entrar en viewport (fade + slide-up) usando
 * IntersectionObserver + transiciones CSS. NO usa la librería Motion: eso
 * mantiene el bundle ligero en todas las rutas (mejor TBT/LCP).
 *
 * La clase `.is-visible` se añade imperativamente sobre el nodo (sin estado
 * de React → sin re-render ni setState-en-effect). El HTML server/cliente es
 * idéntico (siempre clase `reveal`).
 *
 * - Reduced-motion: la media query de globals.css deja el contenido visible
 *   al instante (sin transición).
 * - No-JS: el <noscript> del layout fuerza `.reveal { opacity: 1 }`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  const style = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(stagger ? "reveal-stagger" : "reveal", className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
