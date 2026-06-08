# /juegos/[slug] — Page Overrides

> **Override de MASTER.md** + sujeto a `PRINCIPLES.md` (minimalismo es regla).

> **Nota de reconciliación:** la skill clasificó como "Landing / Marketing" con
> patrón "Horizontal Scroll Journey + Chapter colors + Floating Sticky CTA".
> Descartado: contradice PRINCIPLES (¿chapter colors? ¿floating sticky CTA?
> son justo el chrome que prohibimos). Conservado: smooth scroll reveal,
> imágenes WebP optimizadas, evitar imágenes pesadas.

---

## Estructura — minimalismo aplicado

8 secciones, cada una con **una sola responsabilidad** y silencio entre ellas.

### 1. Hero del juego (fullbleed, 100svh)

- Key art como **única imagen**, fullbleed. Cuando no haya asset real,
  fallback de gradiente cinematográfico derivado de `accentColor` + viñeta.
- Overlay sobre el key art (esquina inferior izquierda):
  - **Badge de estado** (uno, pequeño, arriba del título)
  - **Título** en Fraunces, tamaño grande pero no monstruoso (`clamp(2.5rem, 7vw, 6rem)`)
  - **Tagline** una línea, italic, `--text-muted`
- **NADA más**. Sin breadcrumbs, sin botones "compartir/favorito", sin
  scroll-chevron. El scroll natural se entiende.
- Sin Reveal/animación: el hero ya está visible al cargar; aplicar fade
  retrasaría LCP innecesariamente (anotación de la auditoría H1).

### 2. Tráiler

- Una sección con **un único botón grande** centrado: "▶ Ver tráiler" → abre
  `<TrailerDialog>` reutilizado del home.
- Sin h2, sin eyebrow, sin descripción. El botón **es** la sección.
- `py-24` mínimo.

### 3. Descripción larga

- Una sola columna `max-w-prose` (~65ch).
- Contenido renderizado desde `longDescription.es` como **párrafos sencillos**
  (split por dobles saltos). NO se introduce un parser de markdown completo: la
  copia del catálogo ya está en texto plano con párrafos. Si en futuro se
  necesitan listas/negritas, se conmuta a `react-markdown` con un allowlist.
- Aire generoso: `py-24` mínimo, `space-y-6` entre párrafos, `text-lg`.

### 4. Screenshots gallery

- Grid 1/2/3 cols (mobile/tablet/desktop). Hasta 6 capturas en preview.
- Cada captura abre lightbox con `<Dialog>`. La lightbox ya existe como
  primitive (`ui/dialog.tsx`).
- Si el juego no tiene screenshots (algunos coming-soon) → la sección no se
  renderiza. Cero placeholder "aún sin capturas".
- Fallback de gradiente cuando los archivos no existen (mismo patrón que cards).
- Sin captions ni números decorativos.

### 5. Info técnica (una sola fila)

- `año · género primario · plataformas · estado` como tipografía secundaria,
  centrada, **sin titular, sin iconos, sin tabla**.
- `text-sm` o `text-base` `text-muted`. Inline `·` como separador.

### 6. CTAs externos

- **Un único primario**: el primer link disponible en orden `steam` → `itch` → `site`.
- Resto como links de texto sutiles bajo el botón.
- Si no hay `links` o están en `#` → la sección entera no se renderiza.

### 7. Prev/Next (mínimo absoluto)

- Dos enlaces de texto en los extremos opuestos de la fila final.
- Izquierda: "← Juego anterior" + título del juego previo del catálogo.
- Derecha: "Siguiente juego →" + título del juego siguiente.
- Wrap circular (último → primero).
- Sin botones, sin tarjetas, sin imágenes preview.

### 8. JSON-LD VideoGame

- Inyectado vía `<script type="application/ld+json">` en la cabecera del
  componente. Datos desde `Game`: name, description, genre, gamePlatform,
  applicationCategory: "Game", inLanguage: "es".

## Decisiones de implementación

- **SSG**: `generateStaticParams` con los 10 slugs → todas las páginas son
  estáticas pre-renderizadas.
- **`generateMetadata`** por slug: title + description del juego.
- **Reutilizo**: `TrailerDialog`, `Badge`, `Button`, `Dialog`, `Reveal`,
  `cn`. El page header se construye en línea (no reutilizable).

## Reglas heredadas que cumplo (Pre-Delivery + PRINCIPLES)

- ✅ Touch targets: botones CTA `size="lg"` (≥44px). Cards de lightbox 44+.
- ✅ Focus rings: heredados.
- ✅ Contraste: badge sobre key art usa `bg-black/60` + `text-white` (>10:1).
  Texto del hero sobre key art con degradado oscuro inferior para legibilidad
  4.5:1+ aunque el key art sea claro.
- ✅ Heading order: h1 (título del juego) → h2 (tráiler, descripción,
  capturas) implícitos vía `sr-only` cuando la sección no tenga visible.
- ✅ Reduced motion: heredado.
- ✅ Imágenes: `<Image>` con `alt` descriptivo en screenshots; key art con
  `alt={game.title.es}` solo si NO hay texto visible sobre él (el título
  visual ya cumple semántica).
- ✅ Sin emojis como iconos. El icono `▶` del botón = `<Play>` de Lucide.

## Decisiones descartadas del output de la skill

- ❌ "Horizontal Scroll Journey", "Chapter colors", "Progress bar".
- ❌ "Floating Sticky CTA" — contradice PRINCIPLES (chrome flotante extra).
- ❌ "Active nav highlight" — solo aplica al header global, no aquí.
