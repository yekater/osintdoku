# OSINTDOKU · Cada pista cuenta

Cinco investigaciones interactivas en español de España para practicar verificación de fuentes, cronologías, geolocalización y procedencia de imágenes. Aplicación de navegador con estética cinematográfica, sin registro y con progreso local.

Los expedientes son simulaciones o adaptaciones educativas. Sus documentos e imágenes recreados están identificados como tales; las fuentes periodísticas originales se enlazan por separado. No son pruebas documentales de sucesos reales.

## Desarrollo

Requisitos: Node.js 24 y npm 11. Las dependencias exactas quedan fijadas en `package-lock.json`.

```sh
npm ci
npm run dev
```

En la máquina de Codex, cuyo caché global de npm puede ser de solo lectura, utiliza `npm ci --cache /workspace/.cache/npm`.

El servidor de desarrollo escucha en el puerto 5173. No hacen falta variables secretas, servicios externos ni una base de datos. Los recursos del juego se sirven desde `public/assets`.

## Comprobaciones

```sh
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
```

Las pruebas unitarias verifican el motor deductivo, la unicidad de las cinco soluciones, los estados de celda, la comprobación de relaciones y el almacenamiento. Los recorridos de navegador generan el build y prueban la versión de producción mediante `preview`; comprueban las fases, las evidencias, las ayudas, los veredictos y la persistencia. Las capturas de QA se generan como artefactos de Playwright; se revisan tamaños de 390×844, 768×1024 y 1440×900.

## Expedientes

| N.º | Título | Práctica |
| --- | --- | --- |
| 001 | El mapa de las pistas | Contrastar afirmaciones corporativas |
| 002 | El terreno en disputa | Comparar observaciones y ordenar fechas |
| 003 | El estadio fantasma | Contrastar rasgos para geolocalizar |
| 004 | La fotografía imposible | Reconstruir la procedencia de una imagen |
| 005 | La noticia que nunca ocurrió | Verificar el contexto de una publicación |

Los juegos comparten el principio de deducción, con presentaciones específicas para cada tipo de investigación. Revelar una solución no concede una victoria. El progreso se guarda únicamente en este navegador: borrar los datos del sitio lo elimina.

## Estructura

- `src/cases`: esquema validado y registro de expedientes.
- `src/game`: restricciones, solucionador, validación y progreso versionado.
- `src/components`: experiencia de investigación y controles accesibles.
- `src/app` y `src/styles`: rutas, catálogo y presentación global.
- `public/assets`: imágenes locales y evidencias recreadas.
- `tests`: pruebas unitarias y recorridos de navegador.

Consulta [la auditoría inicial](docs/AUDIT.md), [la guía para añadir expedientes](docs/ADDING_CASES.md) y [la procedencia de los recursos](docs/ASSETS.md).

## Producción

```sh
npm ci
npm run build
npm run preview
```

El build prerenderiza nueve rutas públicas con metadatos y contenido editorial en HTML, también disponibles sin ejecutar JavaScript. La interacción y el progreso local se activan en el navegador.

Cuando conozcas el dominio definitivo, configura su origen al generar el build:

```sh
SITE_URL=https://tu-dominio.es npm run build
```

Con `SITE_URL`, se generan URLs absolutas de Open Graph y enlaces canónicos, además de `sitemap.xml` y `robots.txt`. Sin ese valor no se inventa un dominio de producción. Sustituye el dominio de ejemplo por el real antes del despliegue.

Publica el contenido de `dist/` en un alojamiento estático con HTTPS. Configura una reescritura de las rutas que no correspondan a un fichero hacia `/index.html`, para que las rutas de React Router funcionen al abrirlas directamente. No redirijas los recursos existentes. El servidor de `preview` sirve para revisar el build, no sustituye a un alojamiento de producción.

Ejemplo de Nginx, dentro del bloque `server` cuyo `root` apunta a `dist/`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Si se publica en un subdirectorio, ajusta conjuntamente `base` en Vite y el `basename` del router. Comprueba las URLs de imágenes y las rutas directas antes de publicar.

El enlace comercial de Perinfor está separado de las afirmaciones del juego y puede sustituirse por la URL del curso correspondiente. No se anuncian acreditaciones, precios ni condiciones no contrastadas.

## Accesibilidad y privacidad

Navegación por teclado, estados acompañados de símbolos y texto, descripciones de las evidencias, controles alternativos al arrastre y respeto a la reducción de movimiento. El diseño se orienta a WCAG 2.2 AA; no sustituye a una auditoría externa de accesibilidad.

No hay analítica, pagos ni envío de progreso a servidores. Las fuentes y la formación son enlaces externos; sus condiciones de privacidad pertenecen a sus respectivos proveedores.
