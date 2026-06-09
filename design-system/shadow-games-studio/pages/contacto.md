# /contacto — Page Overrides

> **Override de MASTER.md** + sujeto a `PRINCIPLES.md`.

> **Nota de reconciliación:**
> - `search.py "form validation accessibility" --domain ux` → tres
>   guías aplicables (labels asociadas / validación on-blur / feedback
>   de submit con loading→success/error). **Aplicadas las tres** tal
>   cual.
> - `search.py "contact page form simple cinematic indie studio" --stack
>   shadcn --page contact` → tres guías que recomiendan
>   `react-hook-form + zodResolver + <Form><FormField>` shadcn.
>   **Reconciliadas:** mantenemos react-hook-form + zod (ya está en el
>   stack), **descartamos** la capa `<Form><FormField>` porque exige
>   instalar más componentes shadcn que no usamos en ningún otro
>   sitio; mismo nivel de a11y con `<label htmlFor>` + `aria-invalid`
>   + `aria-describedby` directos y menos chrome.

---

## Tono de referencia

- **Annapurna / Mountains** Contact: un formulario, canales directos
  al lado, cero decoración. Sin mapa, sin "estamos aquí para
  escucharte", sin FAQ.

## Estructura — dos columnas (desktop) / una (mobile)

`grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16` (gap generoso, sin
divider visual). El form pesa visualmente; los canales son satélite.

### Izquierda — Formulario

- Eyebrow "CONTACTO" + h1 corto Fraunces ("Cuéntanos") + subtítulo
  breve. Sin imagen, sin mesh, sin decoración detrás.
- Campos:
  - **Nombre** (input, `required`, min 2).
  - **Email** (input, `type=email`, validación zod).
  - **Asunto** (input, `required`, min 3).
  - **Mensaje** (textarea, `required`, min 20).
  - **Honeypot** (`name="website"`, `<input>` hidden + sr-only +
    `tabIndex={-1}` + `autocomplete="off"`).
- Validación:
  - **Zod schema compartido** (`src/lib/contact-schema.ts`) usado
    por cliente y Server Action (single source of truth).
  - Cliente: `react-hook-form` con `zodResolver`, modo `onBlur` para
    primer error y `onChange` después (UX recomendada por la skill).
  - Errores: `role="alert"`, `aria-invalid`, `aria-describedby`
    apuntando al `<p>` del mensaje.
- Submit:
  - Botón primario violeta (estilo solid).
  - Estados: `idle` → `submitting` (botón disabled + spinner sutil)
    → `success` (toast + form reset + focus al heading de cierre)
    → `error` (toast).
- Server Action `sendContactEmail` en `src/app/actions/contact.ts`:
  - Re-valida con el mismo schema (defensa en profundidad).
  - Honeypot lleno → devuelve `{ ok: true }` silenciosamente (no
    revela al bot que detectamos).
  - Rate-limit in-memory por IP: 5 envíos / 10 min. TODO comentado
    para migrar a Upstash Redis cuando escale.
  - Resend con `RESEND_API_KEY`. Si la env var no está definida →
    devuelve `{ ok: false, kind: "not_configured" }`.
  - Si Resend tira error de API → `{ ok: false, kind: "send_failed" }`.
- Toasts (Sonner): success / error / rate-limited / not-configured.

### Derecha — Canales directos

- Heading h2 pequeño.
- Lista de 4 items:
  - Email (`mailto:shadowgames.devteam@gmail.com`).
  - Discord (placeholder `#` por ahora — visible pero oscurecido).
  - X/Twitter (placeholder `#` por ahora).
  - Press kit → `/press` (link interno real).
- Estilo: `<dl>` o `<ul>` simple. Sin iconos junto a labels. Items
  deshabilitados visualmente cuando href === "#" (cursor default,
  text-subtle), no clickeables.

## Lo que NO se hace

- ❌ "Estamos aquí para escucharte" / "Tu opinión nos importa".
- ❌ Iconos en los campos del form.
- ❌ "* Todos los campos son obligatorios" repetido por campo. Si
  todos son obligatorios, mejor una línea arriba o nada.
- ❌ CAPTCHA visual. Honeypot basta para fase 1.
- ❌ Imagen / mesh / gradiente decorativo detrás del form. El form
  ES el contenido.
- ❌ Mapa, horarios, "encuéntranos en", sidebar FAQ.
- ❌ Tarjetas con border + shadow para canales.

## Decisiones de implementación

- **Form en client component** (`use client`) — react-hook-form lo
  requiere. Página padre sigue siendo SSG.
- **No instalo `<Form><FormField>`** shadcn. Wiring manual idéntico
  a11y, menos superficie. Si en futuro se reusa en 3+ formularios
  se factoriza.
- Schema compartido: import desde `@/lib/contact-schema` en cliente
  y en `actions/contact.ts`.
- Resend: el cliente lo lee server-side, nunca expongo la API key.
- Rate-limit map se borra al reiniciar el server — aceptable para
  fase 1 sin Redis.

## Heredadas (Pre-Delivery + PRINCIPLES)

- ✅ `<label htmlFor>` asociada a cada input (no placeholder-only).
- ✅ `aria-invalid` + `aria-describedby` + `role="alert"` en errores.
- ✅ Focus management tras submit (al heading de cierre o toast).
- ✅ Touch targets ≥44px (inputs `h-12`, botón `size="lg"`).
- ✅ Focus rings: heredados del button + utilidades.
- ✅ Sin emojis decorativos.
