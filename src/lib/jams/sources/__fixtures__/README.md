# Fixtures del Radar de Jams

Muestras **reales y públicas** (no secretos) del HTML/JSON de cada fuente,
capturadas para los tests OFFLINE (`npm run test:fixtures`). Blindan el parseo:
si una fuente cambia su estructura, los tests fallan en vez de que el radar deje
de traer jams en silencio.

## Cómo re-capturar un fixture cuando una fuente cambie legítimamente

Cuando el health-check (`npm run test:health`) avise de un cambio de estructura y
confirmes que es un cambio real de la fuente (no un fallo temporal):

1. Actualiza el adapter (`src/lib/jams/sources/<fuente>.ts`) al nuevo HTML/JSON.
2. Re-captura el fixture con el mismo User-Agent del radar:

```sh
UA="ShadowGamesJamRadar/0.1 (+https://shadowgames.studio; fixtures)"
D=src/lib/jams/sources/__fixtures__

curl -sS -A "$UA" "https://itch.io/jams/upcoming" -o "$D/itch-upcoming.html"
# Detalle: una jam con premio + política de IA + motor (para el test de enriquecimiento)
curl -sS -A "$UA" "https://itch.io/jam/bezi-mega-jam-1" -o "$D/itch-detail.html"
curl -sS -A "$UA" "https://devpost.com/api/hackathons?status[]=open&status[]=upcoming&challenge_type[]=online&challenge_type[]=in-person&per_page=50" -o "$D/devpost.json"
curl -sS -A "$UA" "https://estimuloseconomicos.cultura.gob.pe/2026/estimulos-economicos-para-la-actividad-cinematografica-y-audiovisual-2026" -o "$D/cultura-pe.html"
curl -sS -A "$UA" "https://globalgamejam.org/" -o "$D/globalgamejam.html"
curl -sS -A "$UA" "https://alakajam.com/api/event" -o "$D/alakajam.json"
```

3. Ajusta los asserts concretos de `__tests__/adapters.test.ts` (título/fechas de la
   jam conocida) al contenido del nuevo fixture, y corre `npm test`.

## Ludum Dare

No hay fixture: su API (`api.ldjam.com`) tiene el certificado TLS vencido
(jun-2026) y además responde 400 por Akamai. Cuando la reactiven, capturar:
`curl -sS "https://api.ldjam.com/vx/node/feed/9/parent/event" -o ludumdare.json`.
