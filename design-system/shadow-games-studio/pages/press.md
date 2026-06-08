# /press — Page Overrides

> **Override de MASTER.md** + sujeto a `PRINCIPLES.md` (minimalismo es regla).

> **Nota de reconciliación:** la skill (`search.py "Press kit page indie game
> studio downloads logos fact sheet" --domain landing`) devolvió "Enterprise
> Gateway", "Scroll-Triggered Storytelling" y "Pricing Page + CTA". Los tres
> descartados: corporate-B2B, chapter-colors-progress-bar y comparación de
> planes — ninguno aplica a un press kit. Reconciliado desde brief + tono
> Playdead/Mountains.

---

## Tono de referencia

- **Playdead** press: PDF más que página, sobrio, cero decoración.
- **Mountains** (Florence, A Mortician's Tale): sección "Press" con un
  bloque limpio de descarga y fact-sheet, sin cards ni iconos.
- **NO**: portales de prensa con badges "NEW", grids de logos clickeables
  con previews y CTAs múltiples.

## Estructura — una sola columna `max-w-3xl`, espaciado generoso

### 1. Header de página

- Eyebrow "PRESS" (`text-xs uppercase tracking-widest text-subtle`).
- `h1` "Kit de prensa" en Fraunces, `clamp(2.25rem, 5vw, 4rem)`.
- Subtítulo una línea, `text-base text-muted`.
- **Sin imágenes** en este header (no es la home).

### 2. Bio prensa

- 2-3 párrafos cortos, versión **fáctica** del manifiesto de /estudio.
  No repetir literalmente — aquí va el dato (qué, dónde, desde cuándo).
- Placeholder en i18n marcado y comentario `{/* TODO: bio prensa real */}`.
- `space-y-5 text-base leading-relaxed text-muted`.

### 3. Fact sheet

- **Definition list** semántica (`<dl>` con `<dt>`/`<dd>`).
- Grid CSS de 2 columnas tipográficas: label gris (`text-muted`) +
  valor (`text-text`). **No bordes, no zebra, no iconos.**
- Items mínimos:
  - Fundación · Ubicación · Fundador(es) (placeholder) · Juegos
    publicados (número) · Plataformas · Contacto de prensa
    (`mailto:shadowgames.devteam@gmail.com`) · Web.
- `border-t border-[var(--border)]` entre filas para legibilidad —
  línea hairline, no caja.

### 4. Descargas

- Cuatro botones primarios apilados verticalmente, ancho completo
  hasta `max-w-md`, etiqueta clara + tamaño aproximado entre paréntesis
  cuando se sepa.
- Apuntan a `/press/*.zip` servidos como assets estáticos.
- **Sin badges** ("NEW", "ZIP", "v2"). El sufijo `.zip` ya basta.
- Generación con `scripts/build-press-zip.mjs` (script `npm run press:zip`)
  idempotente. ZIP maestro: `/public/press/shadow-games-press-kit.zip`.

### 5. Trailers

- **Lista vertical** de los 10 juegos (`<ul>` semántico, no grid).
- Cada item: título del juego (Fraunces) · año/estado (text-muted) ·
  un botón "Ver tráiler" alineado a la derecha que abre el dialog
  (TrailerDialog reutilizado, con título del juego inyectado).
- Sin thumbnails ni keyart inline (esos viven en `/juegos/[slug]`).
- Si en futuro un juego no tiene tráiler, el botón se omite — no
  placeholder "Próximamente".

### 6. Contacto de prensa (cierre)

- Una línea: "Para cualquier petición de prensa, escríbenos."
- Un único `<Button variant="outline">` con `mailto:`.
- Sin formulario aquí — el form vive en `/contacto`.

## Lo que NO se hace

- ❌ Iconos junto a items del fact sheet.
- ❌ Badges decorativos en descargas.
- ❌ Screenshots inline (están en `/juegos/[slug]`).
- ❌ Repetir el "Acerca del estudio" de `/estudio`. Aquí va la versión
  prensa, más concreta.
- ❌ FAQ.
- ❌ Cards con border + shadow para los download buttons.

## Generación del ZIP

- Script: `scripts/build-press-zip.mjs` (Node ESM, sin dependencias de
  Next). Usa `adm-zip`.
- Comando: `npm run press:zip`.
- Idempotente: re-genera siempre los 4 ZIPs en `/public/press/`:
  - `shadow-games-logos.zip` — `mark.svg`, `wordmark.svg`, `full.svg`,
    + PNG de cada uno (cuando lleguen los PNG; hoy solo SVG existe).
  - `shadow-games-key-arts.zip` — placeholder vacío en fase 1
    (no hay key arts reales).
  - `shadow-games-screenshots.zip` — placeholder vacío en fase 1.
  - `shadow-games-press-kit.zip` — todo lo anterior + README.txt.
- **TODO** al regenerar cuando lleguen assets reales: el script
  ya incluye un README.txt dentro de cada ZIP que avisa al periodista
  que estos son placeholders de fase 1.

## Decisiones de implementación

- **SSG**: server component puro. La lista de juegos viene de
  `GAMES` (catalog). El cliente solo aparece en el botón de tráiler
  (dialog).
- **`generateMetadata`** desde `Press.title` + `Press.subtitle`.
- Heading order: `h1` → `h2` por bloque (bio, fact, descargas, trailers,
  contacto).

## Heredadas (Pre-Delivery + PRINCIPLES)

- ✅ Contraste, touch targets, focus rings, reduced motion.
- ✅ Cero emojis decorativos.
- ✅ `mailto:` con `aria-label` descriptivo.
