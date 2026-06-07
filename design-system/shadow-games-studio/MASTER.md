# Design System Master File — Shadow Games Studio

> **LOGIC:** Al construir una página, primero consulta `design-system/shadow-games-studio/pages/[page].md`.
> Si existe, sus reglas **anulan** este Master. Si no, sigue lo de abajo.

> **NOTA DE RECONCILIACIÓN (2026-06-06):** Este archivo fue generado por
> `ui-ux-pro-max --design-system --persist` (categoría auto-detectada: *Gaming*).
> Los **defaults genéricos** que produjo la skill (paleta azul #2563EB, fuentes
> Amatic SC/Cabin, estilo "Retro-Futurism con CRT scanlines", anti-patrón
> "❌ Minimalist design") **NO aplican** a este proyecto: contradicen el brief y
> las decisiones de marca fijadas en el bloque de descubrimiento (donde el brief
> es autoridad sobre el color de marca, y frontend-design sobre tipografía).
> Lo que sigue es el sistema **real**, conservando del output de la skill lo que
> sí es transversal: el Pre-Delivery Checklist y los anti-patrones de calidad.
> El registro del output crudo está en el historial de la sesión.

> **⚠️ WORKAROUND OBLIGATORIO con `--page`:** la skill, al ejecutar
> `--persist --page X`, **sobreescribe MASTER.md** con el template genérico de
> la categoría que detecte en ese momento (ha rotado entre "Gaming", "Creator
> Economy Platform", etc.). Para no perder esta reconciliación, el flujo es:
> ```bash
> cp design-system/shadow-games-studio/MASTER.md /tmp/MASTER.bak
> python search.py "..." --design-system --persist -p "Shadow Games Studio" --page <ruta>
> cp /tmp/MASTER.bak design-system/shadow-games-studio/MASTER.md
> # luego, reescribir pages/<ruta>.md sustituyendo el override genérico por
> # uno reconciliado contra la marca real.
> ```
> Verificado 2026-06-06 con `--page juegos`: la skill regeneró MASTER como
> "Vibrant & Block-based / Archivo + Space Grotesk". Descartado, restaurado.

**Project:** Shadow Games Studio · **Category:** Gaming (indie) · **Generated:** 2026-06-06

---

## Global Rules

### Color Palette (REAL — fuente: brief + ui-ux-pro-max color "Gaming")

Tema **oscuro por defecto**, tema claro alterno. Los colores de marca viven como
tokens estáticos en `@theme`; los que conmutan por tema viven en `:root` /
`[data-theme="light"]` (ver `src/app/globals.css`).

| Role | Dark | Light | Token runtime |
|------|------|-------|---------------|
| Background | `#0E0C16` | `#F5F3EF` (crema) | `--bg` |
| Surface | `#181534` (navy) | `#FFFFFF` | `--surface` |
| Texto | `#F5F3EF` | `#181534` | `--text` |
| Texto muted | `#B4B0C7` | `#4A476A` | `--text-muted` |
| Texto subtle | `#7A779A` | `#5A5878` (AA sobre crema) | `--text-subtle` |
| Acento (decorativo) | `#8B5CF6` | `#6D4AD6` | `--accent` |
| Acento bright (hover/glow) | `#A78BFA` | `#6D4AD6` | `--accent-hover` |
| **CTA (fondo botón sólido)** | `#6D4AD6` | `#4D2FAA` | `--accent-deep` |

**Reglas de contraste (verificadas):**
- CTA sólido = fondo `--accent-deep` + texto blanco → **5.8:1 dark / ~8:1 light** (AA). NUNCA `#8B5CF6` de fondo con texto blanco (solo 4.23:1, falla).
- `--accent` `#8B5CF6` se reserva para texto/decoración grande sobre oscuro, glows y bordes.
- En claro, los eyebrows pequeños usan `--accent` (#6D4AD6, 5.9:1) o `--text-subtle` corregido (#5A5878, 6:1). Nunca el subtle viejo (#7A779A → 3.5:1, falla).
- **No** se introduce color de acción cálido (coral/rosa): el "pop" del CTA se logra con **glow violeta + peso semibold + brightness en hover**, manteniendo marca violeta+navy.

### Typography (REAL)

- **Display:** Fraunces (variable, ejes `opsz`/`SOFT`/`WONK`) — vía `next/font/google`, `display: swap`. *(No está en el dataset de la skill; elección de frontend-design: distintiva, no AI-genérica, evita Inter/Space Grotesk.)*
- **Body:** Inter Tight.
- Clase `.font-display` aplica `font-variation-settings: opsz 144, SOFT 50, WONK 0` + `letter-spacing: -0.02em`.
- Line-height body 1.5–1.75; line-length 65–75ch (`max-w-prose`/`max-w-xl`).

### Spacing / Radius / Shadow (REAL — `@theme` en globals.css)

- Radios: `--radius-pill: 999px`, `--radius-card: 14px`, `--radius-lg: 20px`.
- Sombras: `--shadow-glow` (glow violeta del CTA), `--shadow-card`, `--shadow-card-hover`.
- Escala de espaciado: utilidades Tailwind (`py-24`/`py-32` secciones, `gap-5` grids).

### Z-Index Scale (REAL — documentada)

| Capa | z | Uso |
|------|---|-----|
| Contenido / overlays internos | `10` | hero content, badges, degradados de card |
| Header flotante | `40` | nav fija |
| Overlays (Dialog: overlay + content) | `50` | modal de tráiler, menú móvil |
| Skip-link (al enfocar) | `60` | "saltar al contenido" |

---

## Style

**Estilo real:** Dark Mode (OLED, WCAG AAA-friendly) + Hero-Centric + Motion-Driven
(reveals con Motion, mesh animado, grano, partículas). **Video-First** en el hero
(slot listo para loop de gameplay).
*(El default de la skill "Retro-Futurism/CRT scanlines/neon glitch" se descarta — no encaja con el tono cinematográfico premium del brief.)*

**Page Pattern:** Portfolio Grid — Hero → Grid de juegos → Estudio → Merch → Comunidad → Footer. CTA en hover de card + footer.

---

## Component Specs (REAL — ver `src/components/ui/`)

- **Button** (`ui/button.tsx`, cva): variantes `solid` (CTA, fondo `--accent-deep` + glow + semibold), `outline`, `ghost`, `pill`. Tamaños `sm/md/lg/icon`; **icon = 44×44px** (`size-11`) para touch target.
- **Badge** (`ui/badge.tsx`): variante por estado de juego (released/early-access/in-development/coming-soon), texto + color (nunca solo color).
- **Dialog** (`ui/dialog.tsx`, Radix): overlay `backdrop-blur`, close ≥40px, focus ring.
- **GameCard** (`home/game-card.tsx`): fallback de gradiente por `accentColor` hasta tener key art (H2); hover sin layout shift (transform/opacity); meta a `text-white/70`.
- **Reveal** (`motion/reveal.tsx`): fade+slide; sin ramificar por reduced-motion (MotionConfig `reducedMotion="user"` en Providers → conserva fade, quita transform; render server/cliente idéntico).

---

## Anti-Patterns (Do NOT Use)

Del checklist de la skill (transversales, SÍ aplican):
- ❌ **Emojis como iconos** — usar SVG (Lucide para UI, Simple Icons inline para marcas).
- ❌ **Sin `cursor-pointer`** en clickables.
- ❌ **Hovers que desplazan layout** — solo transform/opacity.
- ❌ **Texto bajo 4.5:1**.
- ❌ **Cambios de estado instantáneos** — transiciones 150–300ms.
- ❌ **Focus states invisibles**.

NO aplican (descartados del default genérico): "❌ Minimalist design" y "❌ Static assets"
— nuestro enfoque es minimalismo cinematográfico intencional.

---

## Pre-Delivery Checklist (gate obligatorio al cerrar cada hito)

- [ ] Sin emojis como iconos (SVG)
- [ ] Iconos de set consistente (Lucide / Simple Icons)
- [ ] `cursor-pointer` en todo clickable
- [ ] Hover con transición 150–300ms
- [ ] Contraste texto ≥ 4.5:1 en **dark Y light**
- [ ] Focus rings visibles (teclado)
- [ ] `prefers-reduced-motion` respetado
- [ ] Responsive 375 / 768 / 1024 / 1440
- [ ] Sin contenido tapado por el header fijo
- [ ] Sin scroll horizontal en móvil
- [ ] `alt` en imágenes con significado (vacío si decorativas)
- [ ] `<label>` asociado en inputs (H2: formulario de contacto)
- [ ] Touch targets ≥ 44×44px

---

## Registro de páginas (overrides)

Cada página de H2 tendrá su `pages/[page].md` consultado ANTES de construir.

| Página | Override file | Estado |
|--------|---------------|--------|
| Home | — (usa MASTER) | ✅ H1 cerrado |
| /juegos | `pages/juegos.md` | ⏳ pendiente H2 |
| /juegos/[slug] | `pages/juego-detalle.md` | ⏳ pendiente H2 |
| /estudio | `pages/estudio.md` | ⏳ pendiente H2 |
| /press | `pages/press.md` | ⏳ pendiente H2 |
| /contacto | `pages/contacto.md` | ⏳ pendiente H2 |
