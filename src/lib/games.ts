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
}

/**
 * Catálogo. Los 6 primeros con `featured: true` son los que ven en el home.
 * Las rutas de imágenes apuntan a `/games/<slug>/...`; en H2 colocaremos los
 * placeholders reales (key art generado o fallback). Hasta entonces, los
 * componentes deben degradar a un fallback visual (gradient + título).
 */
export const GAMES: Game[] = [
  {
    slug: "penumbra-eterna",
    title: { es: "Penumbra Eterna", en: "Eternal Dusk" },
    tagline: {
      es: "Un reino sin sol. Una sombra que recuerda.",
      en: "A kingdom without sun. A shadow that remembers.",
    },
    year: 2025,
    status: "released",
    genres: ["action-rpg", "atmosférico", "narrativo"],
    platforms: ["pc", "steam", "ps5"],
    keyArt: "/games/penumbra-eterna/key-art.jpg",
    cardArt: "/games/penumbra-eterna/card.jpg",
    screenshots: [
      "/games/penumbra-eterna/screen-1.jpg",
      "/games/penumbra-eterna/screen-2.jpg",
      "/games/penumbra-eterna/screen-3.jpg",
    ],
    description: {
      es: "Action-RPG en un mundo donde la luz del sol murió hace mil años. Combate con armas de luz residual contra criaturas hechas de olvido.",
    },
    longDescription: {
      es: "En Penumbra Eterna, el sol cayó del cielo hace mil años y desde entonces todo se mueve a media luz. Encarnas a un guardián de la última brasa, capaz de empuñar fragmentos de luz solar fosilizada como arma. Cada zona del mapa tiene su propia regla de iluminación que afecta combate, sigilo y exploración. La narrativa se cuenta en susurros: a través de objetos, ambientes y NPCs que solo te hablan si te quedas quieto el tiempo suficiente.",
    },
    links: {
      steam: "#",
    },
    featured: true,
    accentColor: "#8b5cf6",
  },
  {
    slug: "voces-de-niebla",
    title: { es: "Voces de Niebla", en: "Fog Voices" },
    tagline: { es: "Escucha lo que el bosque no quiere decirte." },
    year: 2025,
    status: "early-access",
    genres: ["horror psicológico", "exploración", "audio-narrativo"],
    platforms: ["pc", "steam"],
    keyArt: "/games/voces-de-niebla/key-art.jpg",
    cardArt: "/games/voces-de-niebla/card.jpg",
    screenshots: [
      "/games/voces-de-niebla/screen-1.jpg",
      "/games/voces-de-niebla/screen-2.jpg",
    ],
    description: {
      es: "Horror psicológico en primera persona donde el audio binaural es la única forma de saber qué te rodea. Una pueblo, un bosque, voces que solo escuchas tú.",
    },
    longDescription: {
      es: "Voces de Niebla es un horror psicológico que se juega tanto con los oídos como con los ojos. Diseñado para audífonos, usa audio binaural en tiempo real para construir un bosque que cambia según lo que escuchas — o crees escuchar. No hay combate. Hay decisiones, silencios, y la certeza creciente de que el bosque te conoce desde antes de que llegaras.",
    },
    links: {
      steam: "#",
    },
    featured: true,
    accentColor: "#6d4ad6",
  },
  {
    slug: "ultimo-tren-sur",
    title: { es: "Último Tren al Sur", en: "Last Train South" },
    tagline: { es: "El sur ya no existe. El tren sigue saliendo." },
    year: 2024,
    status: "released",
    genres: ["aventura narrativa", "puzzle", "pixel art"],
    platforms: ["pc", "mac", "steam", "switch"],
    keyArt: "/games/ultimo-tren-sur/key-art.jpg",
    cardArt: "/games/ultimo-tren-sur/card.jpg",
    screenshots: [
      "/games/ultimo-tren-sur/screen-1.jpg",
      "/games/ultimo-tren-sur/screen-2.jpg",
      "/games/ultimo-tren-sur/screen-3.jpg",
      "/games/ultimo-tren-sur/screen-4.jpg",
    ],
    description: {
      es: "Aventura narrativa de 4 horas en un tren que cruza un país que se está borrando. Cada vagón es un puzzle, cada pasajero un secreto.",
    },
    longDescription: {
      es: "Una aventura corta, densa y profundamente personal. Viajas en el último tren con destino a un país que se está disolviendo desde el sur hacia el norte. Cada vagón es un puzzle ambiental basado en objetos y diálogos, y cada pasajero carga una historia que decide si quiere contarte. El final cambia según cuántos secretos hayas escuchado.",
    },
    links: {
      steam: "#",
      itch: "#",
    },
    featured: true,
  },
  {
    slug: "ceniza-y-cobre",
    title: { es: "Ceniza y Cobre", en: "Ash & Copper" },
    tagline: { es: "Una ciudad que arde despacio. Tú, el último herrero." },
    year: 2026,
    status: "in-development",
    genres: ["crafting", "city-builder", "narrativa"],
    platforms: ["pc", "steam"],
    keyArt: "/games/ceniza-y-cobre/key-art.jpg",
    cardArt: "/games/ceniza-y-cobre/card.jpg",
    screenshots: [],
    description: {
      es: "City-builder íntimo en una ciudad que arde sin prisa. Eres el último herrero: cada herramienta que forjas decide qué barrio sobrevive una noche más.",
    },
    longDescription: {
      es: "Ceniza y Cobre es un city-builder en miniatura sobre una ciudad medieval que lleva siglos ardiendo lentamente. No puedes apagar el fuego — solo retrasarlo. Como último herrero, decides qué herramientas forjar cada noche: una pala salva el cementerio una semana más; una campana avisa al barrio del puerto; una llave permite huir al niño. Pequeñas elecciones, gran peso.",
    },
    featured: true,
  },
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
  },
  {
    slug: "el-coleccionista",
    title: { es: "El Coleccionista", en: "The Collector" },
    tagline: { es: "Catorce objetos. Catorce muertes que no recuerdas." },
    year: 2025,
    status: "released",
    genres: ["narrativa", "detective", "primera persona"],
    platforms: ["pc", "steam"],
    keyArt: "/games/el-coleccionista/key-art.jpg",
    cardArt: "/games/el-coleccionista/card.jpg",
    screenshots: [
      "/games/el-coleccionista/screen-1.jpg",
      "/games/el-coleccionista/screen-2.jpg",
    ],
    description: {
      es: "Detective narrativo en una sola habitación. Catorce objetos, cada uno un crimen. Tu trabajo: ordenar los recuerdos antes de que la habitación se quede sin luz.",
    },
    longDescription: {
      es: "Una sola habitación. Catorce objetos sobre una mesa. Cada uno guarda el recuerdo de un crimen que cometiste y olvidaste. Tienes hasta que la vela se consuma para reconstruir el orden cronológico y entender por qué empezaste a coleccionar. Inspirado en Return of the Obra Dinn y los relatos de Carlos Castán.",
    },
    links: {
      steam: "#",
      itch: "#",
    },
    featured: true,
  },
  {
    slug: "rio-de-sal",
    title: { es: "Río de Sal", en: "Salt River" },
    tagline: { es: "El río no perdona dos veces." },
    year: 2026,
    status: "coming-soon",
    genres: ["roguelike", "supervivencia"],
    platforms: ["pc", "steam"],
    keyArt: "/games/rio-de-sal/key-art.jpg",
    cardArt: "/games/rio-de-sal/card.jpg",
    screenshots: [],
    description: {
      es: "Roguelike de supervivencia río abajo. Cada partida, un río distinto. Cada partida, una sola oportunidad de leer las corrientes.",
    },
    featured: false,
  },
  {
    slug: "marea-baja",
    title: { es: "Marea Baja", en: "Low Tide" },
    tagline: { es: "Cuando el mar se va, lo que deja también respira." },
    year: 2024,
    status: "released",
    genres: ["walking sim", "atmosférico"],
    platforms: ["pc", "mac", "steam"],
    keyArt: "/games/marea-baja/key-art.jpg",
    cardArt: "/games/marea-baja/card.jpg",
    screenshots: [
      "/games/marea-baja/screen-1.jpg",
      "/games/marea-baja/screen-2.jpg",
    ],
    description: {
      es: "Walking sim de 90 minutos en una playa donde el mar se retiró y nunca volvió. Lo que descubres no quería ser visto.",
    },
    links: {
      steam: "#",
      itch: "#",
    },
    featured: false,
  },
  {
    slug: "noche-de-papel",
    title: { es: "Noche de Papel", en: "Paper Night" },
    tagline: { es: "Despliega la noche. Pliega lo que encuentres." },
    year: 2025,
    status: "in-development",
    genres: ["puzzle", "stop-motion"],
    platforms: ["pc", "switch", "mobile"],
    keyArt: "/games/noche-de-papel/key-art.jpg",
    cardArt: "/games/noche-de-papel/card.jpg",
    screenshots: [],
    description: {
      es: "Puzzle estilo stop-motion donde el mundo es papel doblado. Plegando y desplegando avanzas por una noche que cabe en un cuaderno.",
    },
    featured: false,
  },
  {
    slug: "los-jardines-bajo",
    title: { es: "Los Jardines de Abajo", en: "The Gardens Below" },
    tagline: { es: "Lo que crece en la oscuridad también florece." },
    year: 2027,
    status: "coming-soon",
    genres: ["simulación", "atmosférico"],
    platforms: ["pc", "steam", "ps5"],
    keyArt: "/games/los-jardines-bajo/key-art.jpg",
    cardArt: "/games/los-jardines-bajo/card.jpg",
    screenshots: [],
    description: {
      es: "Simulación contemplativa: heredas un jardín subterráneo. Cuídalo. No subas a la superficie hasta que entiendas por qué tu abuela nunca volvió.",
    },
    featured: false,
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
