# Auxiliares — not-found / error / privacidad / aviso-legal

> **Override de MASTER.md** + sujeto a `PRINCIPLES.md`.

> **Nota de reconciliación:** la skill (`search.py "error pages 404
> personality" --domain ux`) devolvió 3 guías sobre `role="alert"`,
> "Error Recovery (clear next steps)" y "Error Feedback (clear messages
> near problem)". **Las 3 aplicadas** en `error.tsx`. No aplican al
> 404 (no es un error de usuario, es navegación fallida) ni a las
> legales (no son errores). El tono del 404 lo decidimos por brand.

---

## 404 (`src/app/[locale]/not-found.tsx`)

- Página fullscreen, **min-h-[100svh]**, centrado vertical y horizontal,
  fondo `--bg`. No forzamos modo oscuro: respetamos la preferencia del
  usuario (los tokens ya garantizan contraste AAA en ambos temas).
- Mensaje principal Fraunces grande: **"Te perdiste en la penumbra."**
  Elegido entre las tres opciones del brief porque (a) ya está en
  el i18n actual de NotFound (consistencia), (b) "perderse" es la
  acción de navegación que el usuario hizo, no una negación seca,
  (c) "penumbra" es la palabra-clave de la marca.
- Subtítulo: "La página que buscas no se encuentra." en `text-muted`.
- **UN solo CTA**: "Volver al inicio →" como **link de texto**
  (PRINCIPLES: una sola acción primaria; aquí ni siquiera necesita
  ser botón sólido).
- Nada más. Sin imagen, sin animación, sin scroll-chevron.

## error.tsx (`src/app/[locale]/error.tsx`)

- Mismo lenguaje visual que el 404. `"use client"` obligatorio.
- Mensaje principal: **"Algo se quebró en las sombras."**
- Subtítulo con `role="alert"` (skill guideline) y el email del
  estudio: "Si vuelve a pasar, escríbenos a shadowgames.devteam@gmail.com."
- Dos acciones (skill guideline "Error Recovery — clear next steps"):
  - `<Button variant="outline">` "Reintentar" → `reset()`.
  - Link de texto "Volver al inicio".
- En `process.env.NODE_ENV === "development"`, mostrar `error.message`
  + `error.digest` debajo en `<pre>` monospace pequeño dentro de un
  `<details>` colapsable. En producción no se renderiza.

## /privacidad (`src/app/[locale]/privacidad/page.tsx`)

- Página de texto sobrio, **una sola columna `max-w-prose`**.
- Header: eyebrow "LEGAL" + h1 "Política de privacidad" Fraunces
  (tamaño más contenido que las páginas marketing, ~`text-4xl`).
- Fecha "Última actualización: <YYYY-MM-DD>" como `<time>` debajo.
- Contenido en secciones con `<h2>` sobrios cubriendo: responsable
  del tratamiento, datos recogidos, finalidad y base legal,
  conservación, derechos del usuario, cookies (mención sin banner),
  contacto.
- Tono legal pero claro, español neutro.
- **NOTA EN CABECERA DEL ARCHIVO**: comentario `// NOTA: revisar
  con abogado antes de producción real.` para que el cliente lo
  recuerde.

## /aviso-legal (`src/app/[locale]/aviso-legal/page.tsx`)

- Mismo patrón visual que `/privacidad`. Mismo header style.
- Contenido: titular del sitio, datos de contacto, condiciones de
  uso, propiedad intelectual, limitación de responsabilidad, ley
  aplicable (Perú + GDPR para visitantes UE).
- Misma nota legal en cabecera.

## Lo que NO se hace

- ❌ 404 con imagen / ilustración decorativa.
- ❌ Botón sólido en el 404 (demasiada llamada para una página
  de "no encontrado").
- ❌ Banner de cookies en /privacidad (no usamos analytics
  intrusivos en fase 1).
- ❌ Tabla con bordes para listar derechos del usuario. Listas
  semánticas y suficiente.
- ❌ Iconos decorativos en titulares legales.

## Heredadas (PRINCIPLES + Pre-Delivery)

- ✅ Heading order: h1 → h2 en cada página legal.
- ✅ `role="alert"` en error.tsx (skill).
- ✅ Touch targets ≥44px en CTAs.
- ✅ Focus rings heredados.
- ✅ Contraste ≥7:1 en texto legal.
