/**
 * Contribuciones del estudio a proyectos de terceros.
 *
 * Por ahora, dos aportaciones al juego Threadbare (de Endless Access). El
 * esquema es data-driven para sumar más sin tocar la página: añade un objeto
 * al array `CONTRIBUTIONS` y coloca sus imágenes en `public/contribuciones/`.
 *
 * Los textos son bilingües (`{ es, en }`); hoy el sitio solo renderiza `es`.
 */

import type { LocalizedString } from "@/lib/games";

/** Enlace externo relacionado (jugar la quest, repo, etc.). */
export interface ContributionLink {
  url: string;
  label: LocalizedString;
}

/** Teaser en YouTube (se monta de forma diferida, solo tras el clic). */
export interface ContributionTeaser {
  /** ID del vídeo de YouTube (no la URL completa). */
  youTubeId: string;
}

/** Encuentro presencial asociado a una contribución (networking, evento…). */
export interface ContributionMeetup {
  date: LocalizedString;
  place: LocalizedString;
  body: LocalizedString;
  /** Fotos del evento; la primera es la principal, el resto van a la galería. */
  photos: string[];
}

export interface Contribution {
  slug: string;
  title: LocalizedString;
  /** Etiqueta de tipo (StoryQuest / LoreQuest…). */
  kind: LocalizedString;
  /** Fecha/duración legible (p.ej. "2025", "Junio de 2026 · 1 semana"). */
  date: LocalizedString;
  /** Imagen de portada del bloque. */
  cover: string;
  /** Si la portada es un póster vertical (se muestra junto al texto, no como banner). */
  coverPortrait?: boolean;
  /** Frase corta bajo el título. */
  lead: LocalizedString;
  /** Cuerpo en párrafos. */
  body: LocalizedString[];
  /** Enlace principal (abre en pestaña nueva). */
  play: ContributionLink;
  /** Capturas del juego para la galería con lightbox. */
  gallery: string[];
  teaser?: ContributionTeaser;
  /** Nota destacada (p.ej. posibilidad de entrar al lore oficial). */
  highlight?: LocalizedString;
  meetup?: ContributionMeetup;
}

export const CONTRIBUTIONS: Contribution[] = [
  {
    slug: "suenos-nocturnos",
    title: { es: "Sueños Nocturnos", en: "Sueños Nocturnos" },
    kind: { es: "StoryQuest", en: "StoryQuest" },
    date: { es: "2025", en: "2025" },
    cover: "/contribuciones/suenos-nocturnos.jpg",
    lead: {
      es: "Una StoryQuest original que creamos para Threadbare.",
      en: "An original StoryQuest we made for Threadbare.",
    },
    body: [
      {
        es: "Un viaje a media luz por un bosque donde los sueños toman forma. Dos niños, una noche que no termina y presencias que observan desde la espesura. La construimos dentro de Threadbare fieles a nuestra obsesión de siempre: la sombra como material.",
        en: "A dim-lit journey through a forest where dreams take shape. Two children, a night that never ends, and presences watching from the thicket. We built it inside Threadbare, true to our lifelong obsession: shadow as material.",
      },
    ],
    play: {
      url: "https://play.threadbare.game/#quests/story_quests/shjourney/0_IntroVideo/IntroVideo",
      label: { es: "Jugar la quest", en: "Play the quest" },
    },
    gallery: [
      "/contribuciones/suenos-nocturnos/01.png",
      "/contribuciones/suenos-nocturnos/02.png",
      "/contribuciones/suenos-nocturnos/03.png",
      "/contribuciones/suenos-nocturnos/04.png",
      "/contribuciones/suenos-nocturnos/05.png",
      "/contribuciones/suenos-nocturnos/06.png",
    ],
    teaser: { youTubeId: "Vuux0B4w_zs" },
    meetup: {
      date: { es: "Diciembre de 2025", en: "December 2025" },
      place: { es: "GameLab · UTP Centro", en: "GameLab · UTP Centro" },
      body: {
        es: "Llevamos Sueños Nocturnos al GameLab de UTP Centro. Fue la oportunidad de mostrar la quest en persona, hacer networking y conocer cara a cara a los mentores y al equipo de Endless Access.",
        en: "We brought Sueños Nocturnos to the GameLab at UTP Centro — a chance to show the quest in person, network, and meet the mentors and the Endless Access team face to face.",
      },
      // La primera es la principal; el resto, galería.
      photos: [
        "/contribuciones/meetup/04.jpg",
        "/contribuciones/meetup/02.jpg",
        "/contribuciones/meetup/01.jpg",
      ],
    },
  },
  {
    slug: "el-ultimo-petalo",
    title: { es: "El último pétalo", en: "The Last Petal" },
    kind: { es: "LoreQuest · Lorejam Mythical Meadows", en: "LoreQuest · Mythical Meadows Lorejam" },
    date: { es: "Junio de 2026 · 1 semana", en: "June 2026 · 1 week" },
    cover: "/contribuciones/mythical-meadows.png",
    coverPortrait: true,
    lead: {
      es: "Nuestra entrada a la Lorejam Mythical Meadows.",
      en: "Our entry for the Mythical Meadows Lorejam.",
    },
    body: [
      {
        es: "El último pétalo es una LoreQuest que creamos en la Lorejam Mythical Meadows: una game jam de una semana dedicada a expandir el universo de Threadbare. Una historia breve tejida con el lore del juego, ambientada en praderas que guardan más de lo que muestran.",
        en: "The Last Petal is a LoreQuest we made for the Mythical Meadows Lorejam — a one-week game jam devoted to expanding Threadbare's universe. A short story woven from the game's lore, set in meadows that hold more than they show.",
      },
      {
        es: "La desarrollamos como equipo-13 y la terminamos el 14 de junio de 2026.",
        en: "We built it as equipo-13 and finished it on June 14, 2026.",
      },
    ],
    play: {
      url: "https://wjt.github.io/threadbare-lorejam-mythical-meadows/branches/wjt/equipo-13/#quests/lore_quests/quest_004/01-El_umbral_del_sueño/mythical_meadows",
      label: { es: "Jugar la quest", en: "Play the quest" },
    },
    gallery: [
      "/contribuciones/mythical-meadows/01.png",
      "/contribuciones/mythical-meadows/02.png",
      "/contribuciones/mythical-meadows/03.png",
    ],
    highlight: {
      es: "Con posibilidad de sumarse al lore oficial de Threadbare.",
      en: "With a chance of joining Threadbare's official lore.",
    },
  },
];
