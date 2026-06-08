# /estudio — Page Overrides

> **Override de MASTER.md** + sujeto a `PRINCIPLES.md` (minimalismo es regla).

> **Nota de reconciliación:** la skill (`search.py "About page studio
> manifesto cinematic indie game" --domain landing`) devolvió "Scroll-Triggered
> Storytelling", "Portfolio Grid" y "Pricing Page + CTA". Descartados los
> tres: el primero impone chapter-colors + progress bar (chrome prohibido
> por PRINCIPLES), el segundo es para portafolios de freelancer, el tercero
> es página de precios. La skill no aporta patrón aplicable aquí; se
> reconcilia desde brief + tono Playdead/Annapurna manualmente.

---

## Tono de referencia

- **Playdead / Inside** About page: silencio, una sola imagen quieta,
  manifiesto en prosa, sin equipo, sin timeline.
- **Annapurna Interactive** "Our Story": una frase grande de propósito,
  3-4 párrafos narrativos, cero KPIs.
- **NO**: páginas corporate de SaaS ("Nuestra misión / visión / valores"
  en grid de 6 iconos).

## Estructura — minimalismo aplicado

Una sola columna `max-w-prose` para todo lo de texto. Aire generoso
(`py-32` mínimo entre bloques).

### 1. Intro visual (fullbleed, ~80svh)

- Fondo: gradiente/mesh sobrio (similar al hero del home pero **más
  quieto**, sin animación de partículas). Re-usa el mismo violeta marca,
  sin acentos de juego.
- Encima, **una sola frase de manifiesto** en Fraunces grande
  (`clamp(2.5rem, 6vw, 5rem)`), centrada, balance.
- Eyebrow `Studio.eyebrow` muy pequeño arriba (`text-xs uppercase
  tracking-widest text-muted`) — opcional, si aporta.
- **Nada más arriba del fold**. Ni botón ni scroll-chevron.

### 2. Manifiesto largo (prosa)

- 4 párrafos placeholder coherentes con "Mundos con sombra, hechos a
  mano". Tono personal y cinematográfico, **prohibidos clichés** indie:
  "apasionados por", "soñamos con crear", "team de soñadores", "amor
  por los videojuegos".
- Marcado con comentario `{/* TODO: bio real */}` en el JSX y nota en
  el i18n.
- `text-lg leading-relaxed text-muted`, `space-y-6`.
- Sin titulares intermedios. Es un manifiesto, no un artículo.

### 3. Tres principios (texto puro)

- Tres bloques verticales, cada uno con:
  - **Kicker** en Fraunces, `text-2xl`, `text-text` (no muted).
  - **Una línea** de desarrollo en Inter Tight, `text-base text-muted`.
- Separados por `mt-12` entre sí, sin border, sin card, sin grid, sin
  icono.
- Tres. Si la skill o el cliente piden más, **descartar el cuarto**.

### 4. Cierre

- Una línea de invitación corta (`text-lg italic text-muted`, centrada).
- **Un único botón** `<Button variant="solid">` hacia `/contacto`.
- En fase 1, Discord SOCIAL.discord = "#" → el CTA va a `/contacto`
  (ruta interna real). Cuando exista URL real de Discord se puede
  conmutar.

## Lo que NO se hace (recordatorio)

- ❌ Timeline "fundado en 2024 / lanzamos X / ganamos Y".
- ❌ Tarjetas de equipo (no hay equipo definido).
- ❌ "Nuestros valores / misión / visión" como titulares.
- ❌ Estadísticas ("10 juegos / 5 jams / 3 años").
- ❌ Scroll-chevron, breadcrumb, CTA flotante.
- ❌ Múltiples CTAs en el cierre. Uno solo.

## Decisiones de implementación

- **SSG** vía `setRequestLocale` + statically rendered (no dynamic data).
- **`generateMetadata`** desde `Studio.title` + `Studio.subtitle`.
- Server component puro (sin estado cliente).
- Heading order: `h1` (frase de manifiesto) → `h2 sr-only` para principios
  → `h3` para cada kicker. (Alternativa: kickers como `<p>` con role
  presentational; preferimos `h3` por SEO + screenreaders.)

## Heredadas (Pre-Delivery + PRINCIPLES)

- ✅ Contraste: copia sobre fondo `--bg` ≥ 7:1 (probado en H1).
- ✅ Reduced motion: heredado vía `<MotionConfig>`.
- ✅ Touch targets: CTA `size="lg"`.
- ✅ Focus rings: heredados.
- ✅ Cero emojis decorativos.
