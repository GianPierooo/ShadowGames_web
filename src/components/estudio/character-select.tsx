"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface Member {
  id: string;
  name: string;
  /** Rol / "clase" del personaje. */
  role: string;
  /** Bio corta (1-3 frases). */
  bio: string;
  portrait: string;
  /** Acento del personaje (glow/borde al seleccionar). */
  accent: string;
}

/**
 * TODO(Leo): reemplaza `role` y `bio` de cada uno por los reales.
 * El orden respeta la foto: Gian a la izquierda, Leo a la derecha.
 */
const TEAM: Member[] = [
  {
    id: "gian",
    name: "Gian Piero Cano",
    role: "Co-fundador · Desarrollo",
    bio: "Mitad del estudio. — bio por completar —",
    portrait: "/equipo/gian.jpg",
    accent: "#8b5cf6",
  },
  {
    id: "leo",
    name: "Leopoldo Brito Ruiz",
    role: "Co-fundador · Desarrollo",
    bio: "La otra mitad del estudio. — bio por completar —",
    portrait: "/equipo/leo.jpg",
    accent: "#e7a95c",
  },
];

/**
 * "Character select" del equipo: dos retratos estilo selector de personaje.
 * Al posar el cursor (o enfocar/tocar) sobre uno, ese toma protagonismo
 * (zoom + glow del acento) y el otro se atenúa/dessatura; abajo aparece la
 * info del seleccionado. En táctil se selecciona con un toque.
 */
export function CharacterSelect() {
  const [active, setActive] = useState<number | null>(null);
  const selected = active !== null ? TEAM[active] : null;

  return (
    <div onMouseLeave={() => setActive(null)}>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:gap-6">
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
                "group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border-2 bg-[var(--surface)]",
                "cursor-pointer transition-[transform,opacity,filter,border-color,box-shadow] duration-300 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
              )}
              // Estilos de estado en inline (deterministas, sin depender de la
              // cascada de utilidades): zoom + glow del activo, atenuado del otro.
              style={{
                transform: isActive ? "scale(1.04)" : isDimmed ? "scale(0.97)" : "scale(1)",
                opacity: isDimmed ? 0.55 : 1,
                filter: isDimmed ? "grayscale(1) brightness(0.85)" : "none",
                borderColor: isActive ? m.accent : "var(--border)",
                boxShadow: isActive ? "var(--shadow-glow)" : "none",
                zIndex: isActive ? 10 : undefined,
              }}
            >
              <Image
                src={m.portrait}
                alt={m.name}
                fill
                sizes="(min-width: 768px) 360px, 45vw"
                className="object-cover object-top transition-transform duration-500 ease-out"
                style={{
                  transform: isActive ? "scale(1.06)" : "scale(1)",
                  filter: !isActive && !isDimmed ? "saturate(0.85)" : undefined,
                }}
              />
              {/* Glow del acento tras el retrato al seleccionar */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(120% 80% at 50% 0%, ${m.accent}33 0%, transparent 60%)` }}
              />
              {/* Degradado inferior + placa de nombre */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                <span className="block font-display text-sm font-bold leading-tight text-white md:text-lg">
                  {m.name}
                </span>
                <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-white/70 md:text-xs">
                  {m.role}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel de info del seleccionado (o prompt neutro) */}
      <div className="mx-auto mt-8 max-w-2xl text-center" aria-live="polite">
        {selected ? (
          <div key={selected.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-display text-2xl font-bold text-[var(--text)] md:text-3xl">
              {selected.name}
            </h3>
            <p
              className="mt-1 text-sm font-medium uppercase tracking-[0.2em]"
              style={{ color: selected.accent }}
            >
              {selected.role}
            </p>
            <p className="mx-auto mt-4 max-w-prose text-lg leading-relaxed text-[var(--text-muted)]">
              {selected.bio}
            </p>
          </div>
        ) : (
          <p className="text-base italic text-[var(--text-subtle)]">
            Pasa el cursor (o toca) sobre cada uno para conocernos.
          </p>
        )}
      </div>
    </div>
  );
}
