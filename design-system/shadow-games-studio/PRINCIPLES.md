# Shadow Games Studio — Design Principles

> **Archivo durable.** No lo toca la skill `--persist`. Vive separado del
> MASTER y de los `pages/` por eso: para sobrevivir a regeneraciones.

> Estas reglas son **vinculantes** y se anteponen a cualquier sugerencia
> del MASTER, de los `pages/<ruta>.md` o del output de la skill cuando
> entren en conflicto. Si una regla del MASTER contradice estos
> principios, gana este archivo y se documenta en el page override.

---

## 1. Minimalismo es regla, no opción

Establecido **2026-06-07**. Aplica a TODO lo que se construya de aquí en adelante.

### Operativa práctica

- **Menos elementos por sección.** Un elemento bien hecho > tres pequeños.
- **Más espacio negativo.** Aire generoso entre secciones (mínimo `py-24` desktop) y dentro de componentes. El silencio visual es contenido.
- **Menos chrome.** Cero badges decorativos. Cero dividers innecesarios. Cero adornos que no transmitan información.
- **Tipografía mínima.** El número más pequeño de tamaños y pesos que pueda contar la historia. Si dudas si una variación tipográfica suma → fuera.
- **Menos copy.** Cada línea de texto debe ganarse el espacio. Si una frase no aporta información o emoción nueva → borrar.
- **Cinematográfico OLED, pero limpio.** La estética sigue siendo oscura y atmosférica; lo que cambia es la densidad. Menos cosas, mejor presentadas.

### Referencias estéticas (autoridades)

- ✅ **Playdead** (`playdead.com`): silencio, una imagen, una palabra, scroll.
- ✅ **Annapurna Interactive** en sus mejores páginas: respeto por el arte.
- ❌ **Devolver Digital**: demasiada personalidad ornamental para este proyecto.
- ❌ Páginas con "carta de menú" de micro-secciones.

### Antipatrones específicos prohibidos

- ❌ Eyebrows + h2 + subtítulo + descripción en la misma sección si no son necesarios. Si el h2 ya dice todo → fuera el eyebrow.
- ❌ Iconos decorativos junto a títulos (los iconos solo si comunican algo: dirección, plataforma, acción).
- ❌ Badges de marketing ("Nuevo", "Popular", "Recomendado", "🔥").
- ❌ Callouts, quote-blocks ornamentales, "fun facts" en cajas decorativas.
- ❌ Scroll-down chevrons ya no aplican fuera del hero principal del home.
- ❌ Breadcrumbs decorativos. Solo si hay 3+ niveles reales de jerarquía y aportan navegación.
- ❌ Más de un CTA primario por vista. El resto son secundarios o links de texto.
- ❌ Sidebars de "info técnica" o "metadata" que compiten con el contenido.
- ❌ Dividers (`<hr>` o `border-t` decorativos) entre secciones cuando el espacio ya las separa.

### Test rápido antes de añadir un elemento

> "Si lo quito, ¿la página pierde información o emoción?"
> Si la respuesta es **no** → no se añade.

### Aplicación a hitos pasados

Los componentes del home (H1) cumplen el espíritu pero podrían tener menos chrome en algunas zonas. **No se refactorizan ahora**; se respetan las decisiones tomadas y se aplica la regla desde aquí (H2.2 en adelante). El home se podría revisar en H3 polish si sobra tiempo.

---

## 2. Workaround obligatorio al usar `--persist --page`

La skill `ui-ux-pro-max`, al ejecutar `--persist --page <X>`, sobreescribe `MASTER.md` con el template genérico de la categoría que detecte (rota entre "Gaming", "Creator Economy Platform", etc.). Para no perder la reconciliación:

```bash
cp design-system/shadow-games-studio/MASTER.md /tmp/MASTER.bak
python "C:/Users/gianp/.claude/skills/ui-ux-pro-max/scripts/search.py" \
  "<query>" --design-system --persist -p "Shadow Games Studio" --page <ruta>
cp /tmp/MASTER.bak design-system/shadow-games-studio/MASTER.md
# luego, reescribir pages/<ruta>.md sustituyendo el override genérico por uno
# reconciliado contra la marca real + este PRINCIPLES.md.
```

**En cada commit que use este flujo, confirmar explícitamente que MASTER.md sigue intacto** (verificar `git status` y `git diff MASTER.md`).

---

## 3. Convivencia con el MASTER y los pages/<ruta>.md

- **PRINCIPLES.md** (este): cómo se piensa el diseño. Durable.
- **MASTER.md**: cómo se materializa el sistema (tokens, paleta, fuentes, escala). Reconciliado.
- **pages/<ruta>.md**: cómo se aplica a una ruta concreta. Hereda MASTER y respeta PRINCIPLES.

Orden de autoridad en caso de conflicto: **PRINCIPLES > pages/X.md > MASTER**.
