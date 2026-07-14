"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface Stat {
  label: string;
  /** 0–100. */
  value: number;
}

interface Member {
  id: string;
  name: string;
  /** "Clase" del personaje (rol). */
  role: string;
  tagline: string;
  portrait: string;
  accent: string;
  stats: Stat[];
}

/**
 * TODO(Leo): rol, tagline y stats son de ejemplo — ajústalos.
 * El orden respeta la foto: Gian a la izquierda, Leo a la derecha.
 */
const TEAM: Member[] = [
  {
    id: "gian",
    name: "Gian Piero Cano",
    role: "Programador",
    tagline: "Arma los mundos desde dentro.",
    portrait: "/equipo/gian.jpg",
    accent: "#8b5cf6",
    stats: [
      { label: "Código", value: 92 },
      { label: "Sistemas", value: 88 },
      { label: "Lógica", value: 90 },
      { label: "Café", value: 99 },
    ],
  },
  {
    id: "leo",
    name: "Leopoldo Brito Ruiz",
    role: "Artista",
    tagline: "Le pone alma a cada proyecto.",
    portrait: "/equipo/leo.jpg",
    accent: "#e7a95c",
    stats: [
      { label: "Arte", value: 91 },
      { label: "Narrativa", value: 89 },
      { label: "Diseño", value: 87 },
      { label: "Ideas", value: 94 },
    ],
  },
];

/**
 * "Character select" del equipo. Dos fichas estilo selector de personaje:
 * el retrato se muestra COMPLETO (sin recortar) y al lado sus estadísticas
 * de videojuego. Al posar el cursor (o enfocar/tocar) sobre una ficha, ese
 * personaje toma protagonismo (zoom + glow de su acento) y el otro se
 * atenúa/dessatura. En táctil se selecciona con un toque.
 */
export function CharacterSelect() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setActive(null)}
      className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 md:gap-6"
    >
      {TEAM.map((m, i) => {
        const isActive = active === i;
        const isDimmed = active !== null && !isActive;
        return (
          <button
            key={m.id}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(isActive ? null : i)}
            aria-pressed={isActive}
            aria-label={m.name}
            className={cn(
              "group flex gap-4 rounded-[var(--radius-lg)] border-2 bg-[var(--surface)] p-4 text-left",
              "cursor-pointer transition-[transform,opacity,filter,border-color,box-shadow] duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
            )}
            style={{
              transform: isActive ? "scale(1.03)" : isDimmed ? "scale(0.98)" : "scale(1)",
              opacity: isDimmed ? 0.55 : 1,
              filter: isDimmed ? "grayscale(1) brightness(0.85)" : "none",
              borderColor: isActive ? m.accent : "var(--border)",
              boxShadow: isActive ? "var(--shadow-glow)" : "none",
            }}
          >
            {/* Retrato COMPLETO (object-contain: no se recorta) */}
            <div className="relative h-56 w-24 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--bg)] sm:h-64 sm:w-32">
              <Image
                src={m.portrait}
                alt={m.name}
                fill
                sizes="128px"
                className="object-contain transition-transform duration-500 ease-out"
                style={{
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  filter: isActive || isDimmed ? "none" : "saturate(0.9)",
                }}
              />
              {/* Glow del acento al seleccionar */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: isActive ? 1 : 0,
                  background: `radial-gradient(120% 70% at 50% 0%, ${m.accent}40 0%, transparent 65%)`,
                }}
              />
            </div>

            {/* Ficha de estadísticas — al lado */}
            <div className="flex min-w-0 flex-1 flex-col">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: m.accent }}
              >
                {m.role}
              </p>
              <h3 className="mt-0.5 font-display text-lg font-bold leading-tight text-[var(--text)] md:text-xl">
                {m.name}
              </h3>
              <p className="mt-1 text-sm italic text-[var(--text-muted)]">{m.tagline}</p>

              <ul className="mt-auto space-y-1.5 pt-4" aria-label={`Estadísticas de ${m.name}`}>
                {m.stats.map((s) => (
                  <li key={s.label} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-[var(--text-subtle)]">
                      {s.label}
                    </span>
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${s.value}%`, background: m.accent }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        );
      })}
    </div>
  );
}
