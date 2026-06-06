"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos (para escalonar varios reveals). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  /** Etiqueta del elemento contenedor. */
  as?: "div" | "section" | "li" | "article";
}

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * Revela su contenido al entrar en viewport (fade + slide-up).
 *
 * No ramifica el JSX según prefers-reduced-motion (eso causaría hydration
 * mismatch entre server y cliente). En su lugar, MotionConfig reducedMotion
 * ="user" (en Providers) desactiva el transform y conserva el fade cuando el
 * usuario pide menos movimiento. El render server/cliente es idéntico.
 */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const props = {
    className,
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, delay, ease: EASE },
  };

  switch (as) {
    case "li":
      return <motion.li {...props}>{children}</motion.li>;
    case "section":
      return <motion.section {...props}>{children}</motion.section>;
    case "article":
      return <motion.article {...props}>{children}</motion.article>;
    default:
      return <motion.div {...props}>{children}</motion.div>;
  }
}
