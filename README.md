# Shadow Games Studio — Web

Sitio del estudio indie de videojuegos Shadow Games. Fase 1: portafolio + showcase de juegos. Fases futuras (jobs, education, open-source) se sumarán sin reescribir la arquitectura.

> "Donde la penumbra cobra vida."

## Stack

- **Next.js 16** (App Router, Turbopack, React 19.2, TypeScript estricto)
- **Tailwind CSS v4** con design tokens en `@theme` (paleta dark/light, escalas)
- **next-intl 4** (i18n: solo `es` en fase 1, infra lista para `en`)
- **next-themes** (toggle dark/light, respeta `prefers-color-scheme`)
- **Motion** para animaciones UI
- **Radix UI** + primitives propias en `src/components/ui/`
- **react-hook-form** + **zod** + **Resend** (formulario de contacto, H2)
- **Sonner** para toasts

## Comandos

```bash
npm run dev         # arranca en localhost:3000 (redirige a /es)
npm run build       # build de producción
npm run start       # sirve el build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run format      # prettier --write .
```

## Estructura

```
src/
  app/
    layout.tsx              ← layout raíz (pass-through, requerido por Next)
    [locale]/
      layout.tsx            ← layout real, fonts + metadata + providers
      page.tsx              ← home (placeholder en H0, real en H1)
  components/
    providers.tsx           ← ThemeProvider + Toaster
    theme-toggle.tsx        ← toggle dark/light
    ui/                     ← primitives shadcn-style propias
  i18n/
    routing.ts              ← config rutas localizadas
    request.ts              ← carga mensajes por request
    navigation.ts           ← Link/redirect tipados
    messages/es.json        ← cadenas en español
  lib/
    cn.ts                   ← clsx + tailwind-merge
    games.ts                ← catálogo (10 fakes en fase 1, schema listo para Sanity)
    social.ts               ← URLs sociales (placeholders en fase 1)
  proxy.ts                  ← next-intl middleware (renombrado en Next 16)
public/
  brand/                    ← logos
  games/<slug>/             ← key art, cards, screenshots (vacío hasta H1)
```

## Internacionalización

Fase 1: solo español. Las rutas viven en `/es/...` con prefijo siempre presente. La raíz `/` redirige a `/es`.

Para añadir inglés en el futuro: agregar `"en"` a `routing.locales` en `src/i18n/routing.ts`, traducir `pathnames`, y crear `messages/en.json`. Todo el código de componentes ya usa `getTranslations`/`useTranslations`.

## Diseño

- **Paleta**: navy `#181534` + crema `#f5f3ef` + violeta `#8b5cf6` (`#6d4ad6` en modo claro para contraste AA).
- **Display**: Fraunces (variable, opsz/SOFT/WONK).
- **Body**: Inter Tight.
- **Tema por defecto**: oscuro. Toggle visible en header.

Tokens en `src/app/globals.css` (`@theme`). Cuando cambies un color, hazlo ahí.

## Catálogo de juegos

Los juegos viven en `src/lib/games.ts` con schema completo (slug, título, tagline, año, estado, géneros, plataformas, key art, trailer, screenshots, descripción corta/larga, links, featured, accent color). Los 6 con `featured: true` aparecen en el home.

Para añadir un juego:
1. Añadir entrada al array `GAMES` con un `slug` único.
2. Crear `public/games/<slug>/` con `key-art.jpg`, `card.jpg`, screenshots.
3. Marcar `featured: true` solo si quieres que aparezca en el home (máx 6).

## Reservado para fase 2

- GSAP + ScrollTrigger (storytelling de scroll)
- Sanity CMS (sustituir `lib/games.ts` por `lib/games-source.ts`)
- Rutas `/jobs`, `/learn`, `/open-source`

## Variables de entorno

Ver `.env.example`. Para desarrollo local copiar a `.env.local`.
