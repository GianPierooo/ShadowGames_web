# Shadow Games Studio — Web

Sitio del estudio indie de videojuegos Shadow Games. **Fase 1**: portafolio + showcase de juegos. Las fases futuras (jobs, education, open-source) se sumarán sin reescribir la arquitectura.

> "Donde la penumbra cobra vida." · "Mundos con sombra, hechos a mano."

---

## Stack

- **Next.js 16** — App Router, Turbopack, React 19.2, TypeScript estricto.
- **Tailwind CSS v4** — design tokens en `@theme` (paleta dark/light, spacing, radios).
- **next-intl 4** — i18n (solo `es` en fase 1, infra lista para `en`).
- **next-themes** — toggle dark/light, respeta `prefers-color-scheme`.
- **Radix UI** + primitives propias en `src/components/ui/`.
- **react-hook-form** + **zod** + **Resend** — formulario de contacto.
- **Sonner** — toasts (montado solo en `/contacto`).
- **next/og** — Open Graph images dinámicas.

> Sin librería de animación: las entradas usan **CSS puro** (hero) e **IntersectionObserver + CSS** (`<Reveal>`). Motion se retiró del bundle por rendimiento.

---

## Levantar en local

```bash
npm install
cp .env.example .env.local     # rellena RESEND_API_KEY si vas a probar el form
npm run dev                    # http://localhost:3000  (redirige a /es)
```

### Scripts

```bash
npm run dev         # desarrollo (Turbopack)
npm run build       # build de producción
npm run start       # sirve el build de producción
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run format      # prettier --write .
npm run press:zip   # regenera los ZIPs del press kit (ver abajo)
```

---

## Estructura

```
src/
  app/
    layout.tsx                 ← layout raíz (pass-through, requerido por Next)
    icon.svg                   ← favicon (convención de archivos)
    apple-icon.tsx             ← apple-touch-icon (next/og)
    manifest.ts                ← web app manifest
    robots.ts                  ← robots.txt autogenerado
    sitemap.ts                 ← sitemap.xml autogenerado (con hreflang)
    actions/contact.ts         ← Server Action del form (Resend + honeypot + rate-limit)
    [locale]/
      layout.tsx               ← layout real: fonts, metadata, JSON-LD Organization, providers
      page.tsx                 ← home
      opengraph-image.tsx      ← OG genérica
      not-found.tsx            ← 404
      error.tsx                ← error boundary
      juegos/page.tsx          ← catálogo + filtros (estado/género) por URL
      juegos/[slug]/page.tsx   ← detalle de juego (+ opengraph-image.tsx por juego)
      estudio/ press/ contacto/ privacidad/ aviso-legal/
  components/
    providers.tsx              ← ThemeProvider (next-themes)
    theme-toggle.tsx
    site/                      ← header, footer, brand-mark, social-links
    home/                      ← hero, featured-games, studio, merch, community, game-card
    games/                     ← filter-bar, screenshots-gallery, game-image
    contact/contact-form.tsx
    press/press-trailer-button.tsx
    legal/legal-page.tsx       ← layout compartido /privacidad y /aviso-legal
    motion/reveal.tsx          ← reveal on-scroll (IntersectionObserver + CSS)
    ui/                        ← primitives propias (button, input, textarea, badge, dialog, toaster…)
  i18n/
    routing.ts                 ← rutas localizadas
    request.ts                 ← carga de mensajes por request
    navigation.ts              ← Link/redirect/usePathname tipados
    messages/es.json           ← TODAS las cadenas en español
  lib/
    games.ts                   ← catálogo (10 juegos; schema listo para CMS en fase 2)
    site.ts                    ← SITE_URL + helper de canonical/hreflang
    social.ts                  ← URLs sociales (placeholders "#")
    filters.ts                 ← parseo de filtros del catálogo
    contact-schema.ts          ← schema zod compartido cliente/servidor
    cn.ts                      ← clsx + tailwind-merge
  proxy.ts                     ← middleware de next-intl (renombrado en Next 16)
scripts/
  build-press-zip.mjs          ← genera los ZIPs del press kit
design-system/shadow-games-studio/
  PRINCIPLES.md                ← reglas de diseño DURADERAS (minimalismo, antipatrones)
  MASTER.md                    ← design system base (no editar a mano; ver nota interna)
  pages/*.md                   ← overrides por ruta
public/
  brand/logo.svg               ← logo placeholder
  games/<slug>/                ← key art, cards, screenshots (vacío en fase 1)
  press/*.zip                  ← press kit generado
```

---

## Cómo añadir un juego

1. Añade una entrada al array `GAMES` en **`src/lib/games.ts`** con un `slug` único y estable (no lo cambies tras publicar: rompe enlaces y SEO).
2. Crea `public/games/<slug>/` con `key-art.jpg`, `card.jpg` y `screen-1.jpg…` cuando tengas los assets. Mientras no existan, la UI degrada a un fallback de gradiente automáticamente.
3. `featured: true` solo si quieres que aparezca en el grid del home (máx. 6).
4. Campos opcionales (`trailer`, `longDescription`, `links`, `accentColor`, `screenshots`) se omiten con elegancia si faltan — no hace falta rellenarlos todos.

La nueva ruta `/es/juegos/<slug>`, su OG image, el sitemap y el JSON-LD se generan solos (SSG).

---

## Cómo cambiar el copy (i18n)

Todo el texto vive en **`src/i18n/messages/es.json`**, agrupado por namespace (`Home`, `Games`, `Studio`, `Press`, `Contact`, `Legal`, `Footer`…). Edita el valor y listo; los componentes lo leen con `getTranslations`/`useTranslations`.

**Para añadir inglés** en el futuro: añade `"en"` a `routing.locales` en `src/i18n/routing.ts`, traduce los `pathnames`, y crea `messages/en.json`. El código de componentes ya está preparado.

> Bloques marcados `// TODO: bio real` / `bio prensa real` en `/estudio` y `/press` son placeholders pendientes de copy definitivo del cliente.

---

## Diseño y tokens

- **Paleta**: navy `#181534` + crema `#f5f3ef` + violeta `#8b5cf6` (`#6d4ad6` en claro para contraste AA).
- **Display**: Fraunces (variable). **Body**: Inter Tight. **Tema por defecto**: oscuro.
- **Tokens** (colores, radios, sombras, **escala de spacing de sección**): `src/app/globals.css` dentro de `@theme`. Cambia un color/espaciado ahí y se propaga.
- **Reglas de diseño**: `design-system/shadow-games-studio/PRINCIPLES.md` (minimalismo, antipatrones prohibidos). Orden de autoridad: **PRINCIPLES > pages/\<ruta\>.md > MASTER**.

---

## Press kit (ZIPs)

Los ZIPs descargables de `/press` se generan con un script idempotente:

```bash
npm run press:zip
```

Crea en `public/press/`: `shadow-games-logos.zip`, `shadow-games-key-arts.zip`, `shadow-games-screenshots.zip` y el maestro `shadow-games-press-kit.zip`. En fase 1 contienen el logo placeholder + READMEs explicativos; **vuelve a ejecutarlo** cuando lleguen el logo definitivo, las key arts y las screenshots reales.

---

## Variables de entorno

Ver **`.env.example`**. En local van en `.env.local` (gitignored). En producción, en Vercel → Settings → Environment Variables.

| Variable | Requerida | Uso |
|---|---|---|
| `RESEND_API_KEY` | Sí (prod) | Envío del formulario de contacto vía Resend. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública (canonical, sitemap, robots, OG). Sin barra final. |
| `CONTACT_EMAIL` | No | Inbox que recibe el form. Default `shadowgames.devteam@gmail.com`. |
| `RESEND_FROM` | No | Remitente. Default `onboarding@resend.dev` (solo entrega al email de la cuenta Resend hasta verificar dominio). |

> Sin `RESEND_API_KEY`, el formulario degrada con elegancia: muestra un toast "servicio de email no configurado" en vez de romperse.

---

## Deploy (Vercel)

El proyecto despliega en Vercel con configuración por defecto (framework Next.js autodetectado). Pasos resumidos:

1. Push del repo a GitHub.
2. Vercel → **Add New… → Project → Import** el repo.
3. Añadir las variables de entorno (tabla de arriba) antes del primer deploy.
4. **Deploy**.

`robots.txt`, `sitemap.xml`, OG images, favicons y manifest se sirven automáticamente.

### Conectar un dominio propio

Cuando registres el dominio (p. ej. `shadowgames.studio`):

1. **Vercel → Project → Settings → Domains → Add** e introduce el dominio.
2. Vercel te dará los registros DNS:
   - Apex (`shadowgames.studio`) → registro **A** a `76.76.21.21`, **o** ALIAS/ANAME al destino que indique Vercel.
   - `www` → registro **CNAME** a `cname.vercel-dns.com`.
3. Configura esos registros en tu proveedor de DNS (donde compraste el dominio) y espera la propagación (minutos a unas horas). Vercel emite el certificado SSL solo.
4. Marca el dominio como **Primary** en Vercel (redirige el `.vercel.app` al dominio propio).
5. Actualiza la variable **`NEXT_PUBLIC_SITE_URL`** en Vercel al nuevo dominio y vuelve a desplegar, para que canonical/sitemap/OG usen la URL definitiva.

---

## Reservado para fase 2

- GSAP + ScrollTrigger (storytelling de scroll más rico).
- Sanity CMS — sustituir `lib/games.ts` por una fuente remota sin tocar componentes.
- Rutas `/jobs`, `/learn`, `/open-source`.
- Tienda real de merch (la sección "Shadow Stuff" es placeholder).
- Inglés (`en`) — infra i18n ya lista.
