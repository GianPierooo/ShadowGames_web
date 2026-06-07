# /juegos — Page Overrides

> **Override de MASTER.md.** Solo se documentan desviaciones; lo demás hereda.

> **Nota de reconciliación:** la skill clasificó esta página como "Search
> Results" con sugerencias inaplicables ("Number animations, percentage change,
> profit/loss color transitions"). Descartado. Lo siguiente es el override real
> del catálogo, basado en el patrón **Portfolio Grid** del MASTER aplicado a un
> catálogo de 10 juegos cinematográficos.

---

## Estructura de la página

1. **Page header** — eyebrow ("Catálogo") + h1 ("Nuestros juegos") + descripción corta. Sin hero a pantalla completa: el hero es la home.
2. **Barra de filtros sticky** — pills de estado + dropdown de género. Pegada bajo el header flotante (top-24) con z-30 (entre contenido z-10 y header z-40, según escala MASTER).
3. **Resultados** — contador "X de 10 juegos" + grid 1/2/3/4 cols (mobile/tablet/lg/xl).
4. **Empty state** — cuando los filtros no matchean: texto i18n `Games.empty` + botón "Limpiar filtros".

## Filtros — decisiones

- **Estado** (`?estado=disponible|early-access|en-desarrollo|proximamente`):
  pills horizontales. Una activa a la vez (radio). "Todos" como neutral.
  Slugs en español en la URL para SEO local; mapeo a `GameStatus` interno.
- **Género** (`?genero=<slug>`): Radix DropdownMenu (mejor a11y que `<select>`
  custom + 44px touch target garantizado).
- **Sort**: `featured` primero, luego `year` desc. NO se expone como filtro UI
  en H2 (decisión: mantener simple; añadir en H3 si hay demanda).

## URL como estado canónico (SEO + compartibilidad)

- Server component lee `searchParams` (Promise en Next 16) y filtra en server.
- Client FilterBar usa `useSearchParams` + `useRouter.replace()` (no `push`,
  no quiero saturar el historial al cambiar de filtro).
- `scroll: false` en replace para que la barra sticky no salte.
- `aria-current="true"` en el chip activo (guideline Navigation/Active State).

## Catálogo / grid

- **Reutilizo `GameCard`** del home tal cual: ratio 4:5, fallback de gradiente,
  hover sin layout shift, badge de estado.
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- Gap: `gap-5` (igual que el home, por coherencia).

## Reglas heredadas que cumplo (Pre-Delivery Checklist)

- **Touch targets**: pills de estado `h-11` (44px). Dropdown trigger `h-11`.
- **Focus rings**: heredados del Button/global. Chips usan focus-visible explícito.
- **Sin scroll horizontal**: filter bar permite overflow-x con scroll en mobile
  cuando hay muchos chips (`overflow-x-auto -mx-6 px-6`).
- **Contraste**: chip activo `bg-[var(--accent-deep)] text-white` (5.8:1),
  no `bg-[var(--accent)]` (4.23:1, falla AA).
- **Reduced motion**: hereda de MotionConfig en Providers.
- **Empty state**: incluye CTA "Limpiar filtros" para recuperar (guideline Feedback).

## Sin overrides de paleta/fuente/spacing

Hereda MASTER. La página debe sentirse **continua con la home** — misma marca,
mismo tono cinematográfico OLED.

## Decisiones que NO sigo del output de la skill

- ❌ "Number animations (count-up), profit/loss color transitions" — irrelevante
  (eso es dashboard financiero).
- ❌ "Masonry" del pattern Portfolio Grid: las cards son uniformes 4:5; masonry
  sería caos. Grid regular es coherente con el home y mejor para escaneo.
- ❌ "Neutral background, accent minimal" — el brief manda violeta+navy.
