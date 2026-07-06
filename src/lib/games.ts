/**
 * Catálogo de juegos — fase 1: 10 fakes cinematográficos coherentes con la marca.
 * Schema preparado para migrar a Sanity en fase 2 sin tocar componentes.
 *
 * Reglas:
 * - Los slugs son únicos y estables (no cambiar después de publicar; rompe enlaces).
 * - `featured: true` → aparece en el grid del home (máx 6 destacados).
 * - `accentColor` permite override del violeta global en la página de detalle.
 * - `trailer` es opcional; si falta, la UI muestra el key art con overlay.
 */

export type GameStatus = "released" | "early-access" | "in-development" | "coming-soon";

export type GamePlatform = "pc" | "mac" | "steam" | "switch" | "ps5" | "xbox" | "mobile";

export interface LocalizedString {
  es: string;
  en?: string;
}

export interface GameTrailer {
  type: "youtube" | "mp4";
  src: string;
  poster: string;
}

export interface GameLinks {
  steam?: string;
  itch?: string;
  site?: string;
  presskit?: string;
}

/**
 * Demo jugable / material interactivo del juego en la página de detalle.
 * Campo OPCIONAL: si un juego no tiene `demo`, no se renderiza nada (cero
 * placeholders). Tres variantes según cómo exporta el motor:
 *
 *  - "embed"    → build HTML5/WebGL jugable EN LA MISMA PÁGINA (iframe).
 *                 Godot / Unity / Jabalí exportan a WebGL. Puede ser:
 *                   a) SELF-HOST sin terceros ("tipo itch.io" en nuestro
 *                      dominio): sube el build a `public/games/<slug>/demo/`
 *                      y apunta `url` a "/games/<slug>/demo/index.html".
 *                   b) EMBED EXTERNO de itch.io: usa la URL del iframe que
 *                      itch te da en "Embed options" (https://itch.io/embed-upload/...).
 *
 *  - "video"    → tráiler/gameplay para motores que NO exportan a web (Unreal)
 *                 o cuando solo quieres mostrar vídeo. `provider`:
 *                   · "youtube" → `url` = ID (p.ej. "dQw4w9WgXcQ") o URL de YouTube.
 *                   · "mp4"     → `url` = ruta a un archivo propio, ideal same-origin
 *                                  (p.ej. "/games/<slug>/trailer.mp4"), sin terceros.
 *
 *  - "download" → enlace directo al build de PC (Unreal u otros sin web).
 *                 `url` = enlace al instalador/zip; `platform` = etiqueta visible
 *                 en el botón (p.ej. "Windows", "Windows / Linux").
 */
export type GameDemo =
  | {
      kind: "embed";
      /**
       * URL del build HTML5/WebGL. Same-origin ("/games/<slug>/demo/index.html")
       * para self-host sin terceros, o URL del iframe de itch.io para embed externo.
       */
      url: string;
      /** Relación de aspecto del canvas del build (ancho/alto). Default 16/9. */
      aspectRatio?: number;
    }
  | {
      kind: "video";
      provider: "youtube" | "mp4";
      /** youtube: ID o URL del vídeo. mp4: ruta al archivo (ideal same-origin). */
      url: string;
    }
  | {
      kind: "download";
      /** Enlace directo al build (instalador o .zip). */
      url: string;
      /** Etiqueta de plataforma mostrada en el botón (p.ej. "Windows"). */
      platform: string;
    };

export interface Game {
  slug: string;
  title: LocalizedString;
  tagline: LocalizedString;
  year: number;
  status: GameStatus;
  genres: string[];
  platforms: GamePlatform[];
  keyArt: string;
  cardArt: string;
  trailer?: GameTrailer;
  screenshots: string[];
  description: LocalizedString;
  longDescription?: LocalizedString;
  links?: GameLinks;
  featured: boolean;
  accentColor?: string;
  /** Demo jugable / vídeo / descarga en la página de detalle. Ver `GameDemo`. */
  demo?: GameDemo;
}

/**
 * Catálogo. `featured: true` (máx. 6) son los que se ven en el home.
 * `keyArt`/`cardArt` apuntan a `/games/<slug>/...`; si el archivo no existe
 * todavía, `GameImage` degrada sola al fallback visual (gradient + inicial).
 */
export const GAMES: Game[] = [
  {
    slug: "luminaria",
    title: { es: "Luminaria", en: "Luminaria" },
    tagline: { es: "Pinta de luz. Borra de sombra." },
    year: 2025,
    status: "released",
    genres: ["puzzle", "plataformas", "arte"],
    platforms: ["pc", "mac", "steam", "switch", "mobile"],
    keyArt: "/games/luminaria/key-art.jpg",
    cardArt: "/games/luminaria/card.jpg",
    screenshots: [
      "/games/luminaria/screen-1.jpg",
      "/games/luminaria/screen-2.jpg",
      "/games/luminaria/screen-3.jpg",
    ],
    description: {
      es: "Puzzle-plataformas donde tu pincel pinta luz para crear plataformas, abrir caminos y revelar enemigos. Sin texto. Solo color.",
    },
    longDescription: {
      es: "Luminaria es un puzzle-plataformas minimalista sin una sola palabra de texto. Tu pincel pinta tres colores de luz, cada uno con propiedades distintas: cian solidifica, magenta empuja, amarillo revela. Combinándolos resuelves puzzles ambientales que escalan en complejidad con la misma economía de medios que un cuadro de Rothko.",
    },
    links: {
      steam: "#",
    },
    featured: true,
    accentColor: "#a78bfa",
    // DEMO EMBED (self-host, sin terceros). El build HTML5 vive en
    // `public/games/luminaria/demo/index.html` → se juega en la misma página.
    // Para un embed de itch.io en su lugar: reemplaza `url` por la URL del
    // iframe que da itch en "Embed options" (https://itch.io/embed-upload/NNN?...).
    demo: {
      kind: "embed",
      url: "/games/luminaria/demo/index.html",
      aspectRatio: 16 / 9,
    },
  },
  // ── Juego REAL de ShadowGames (Godot 4, jugable en la misma página) ──────
  // Título y tagline tomados de la pantalla de título del juego.
  {
    slug: "metamorfosis",
    title: { es: "Metamorfosis", en: "Metamorphosis" },
    tagline: {
      es: "La belleza del proceso.",
      en: "The beauty of the process.",
    },
    year: 2025,
    status: "released",
    genres: ["narrativo", "atmosférico", "aventura"],
    platforms: ["pc"],
    keyArt: "/games/metamorfosis/key-art.jpg",
    cardArt: "/games/metamorfosis/card.jpg",
    screenshots: [],
    description: {
      es: "Una pequeña odisea sobre la transformación: acompañas a una oruga desde la pradera hasta el vuelo, pasando por la quietud de la crisálida. Un juego corto hecho en Godot, jugable aquí mismo en el navegador.",
      en: "A small odyssey about transformation: you follow a caterpillar from the meadow to flight, through the stillness of the chrysalis. A short game made in Godot, playable right here in the browser.",
    },
    featured: true,
    // DEMO EMBED — build de Godot 4 (Web/HTML5, sin threads) self-hosted en
    // public/games/metamorfosis/demo/. Se juega en la misma página, sin terceros.
    // Resolución base 1280×720 → aspect ratio 16:9.
    demo: {
      kind: "embed",
      url: "/games/metamorfosis/demo/index.html",
      aspectRatio: 16 / 9,
    },
  },
  // ── Juego REAL de ShadowGames (Godot 4, jugable en la misma página) ──────
  // Título "Fragmentos del Mañana" tomado de la pantalla de título del juego.
  // El slug se mantiene "econexo" (nombre de proyecto; estable, no romper enlaces).
  // TODO(Leo): afina la descripción a la trama real si hace falta.
  {
    slug: "econexo",
    title: { es: "Fragmentos del Mañana", en: "Fragments of Tomorrow" },
    tagline: {
      es: "Reconecta el mañana, fragmento a fragmento.",
      en: "Reconnect tomorrow, one fragment at a time.",
    },
    year: 2025,
    status: "released",
    genres: ["puzzle", "misterio", "narrativo"],
    platforms: ["pc"],
    keyArt: "/games/econexo/key-art.jpg",
    cardArt: "/games/econexo/card.jpg",
    screenshots: [],
    description: {
      es: "Una aventura de misterio con puzzles de conexión: explora espacios en penumbra, tiende cables entre puertos para devolver la energía y reconstruye, pieza a pieza, un mañana fragmentado. Hecho en Godot, jugable aquí mismo en el navegador.",
      en: "A mystery adventure built on connection puzzles: explore dim spaces, wire ports together to restore power, and rebuild a fragmented tomorrow piece by piece. Made in Godot, playable right here in the browser.",
    },
    featured: true,
    // DEMO EMBED — build de Godot 4 (Web/HTML5, sin threads) self-hosted en
    // public/games/econexo/demo/ (nombre de proyecto: EcoNexo).
    // Resolución base 1920×1080 → aspect ratio 16:9.
    demo: {
      kind: "embed",
      url: "/games/econexo/demo/index.html",
      aspectRatio: 16 / 9,
    },
  },
];

/** Lista de juegos destacados (los del home grid). */
export function getFeaturedGames(): Game[] {
  return GAMES.filter((g) => g.featured);
}

/** Busca un juego por slug. */
export function getGameBySlug(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Lista todos los géneros únicos del catálogo (para filtros). */
export function getAllGenres(): string[] {
  const set = new Set<string>();
  for (const g of GAMES) {
    for (const genre of g.genres) set.add(genre);
  }
  return Array.from(set).sort();
}

/**
 * Vecinos del juego en el catálogo (orden de declaración).
 * Wrap circular: el primero apunta al último como `prev` y viceversa.
 */
export function getGameNeighbors(slug: string): { prev: Game; next: Game } | null {
  const idx = GAMES.findIndex((g) => g.slug === slug);
  if (idx === -1) return null;
  const prev = GAMES[(idx - 1 + GAMES.length) % GAMES.length]!;
  const next = GAMES[(idx + 1) % GAMES.length]!;
  return { prev, next };
}

/** Lista todos los estados únicos presentes en el catálogo. */
export function getAllStatuses(): GameStatus[] {
  const set = new Set<GameStatus>();
  for (const g of GAMES) set.add(g.status);
  // Orden lógico de presentación
  const order: GameStatus[] = ["released", "early-access", "in-development", "coming-soon"];
  return order.filter((s) => set.has(s));
}
