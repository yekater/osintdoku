# Entrega de OSINTDOKU V5

Se ha creado una aplicación nueva en React y TypeScript estricto: el repositorio inicial estaba vacío. Toda la experiencia del jugador está en español de España.

## Funcionalidad entregada

- Portada cinematográfica, catálogo con búsqueda y filtros, laboratorio y archivo personal.
- Cinco investigaciones con siete fases: portada, briefing, escena, evidencias, deducción, veredicto y resolución.
- Inspección con zoom, desplazamiento y puntos de interés; visor de pruebas con procedencia, teclado y cierre accesible.
- Matriz de cuatro estados, cronología reordenable, comparación de imágenes de parcela, geolocalización, cadena documental y verificación del contexto.
- Pistas progresivas, comprobación, deshacer y reinicio; ninguna solución revelada concede una victoria ni borra una victoria ya obtenida.
- Progreso local versionado, recuperación de datos válidos y conservación del registro antiguo sin transferir sus victorias a los nuevos puzzles.
- Fuentes originales, reconstrucciones identificadas y formación de Perinfor después del resultado.
- 39 recursos visuales locales con documentación de procedencia y licencias; tipografías locales.

| Expediente | Mecánica principal | Estado |
| --- | --- | --- |
| 001 · El mapa de las pistas | Relación entre afirmaciones, documentos y fechas | Jugable; solución única |
| 002 · El terreno en disputa | Comparación antes/después y orden cronológico | Jugable; solución única |
| 003 · El estadio fantasma | Contraste de perfiles visuales y localizaciones | Jugable; solución única |
| 004 · La fotografía imposible | Reconstrucción de una cadena de procedencia | Jugable; solución única |
| 005 · La noticia que nunca ocurrió | Relación entre publicaciones y contexto original | Jugable; solución única |

## Arquitectura

Los expedientes se declaran como datos validados con Zod. El motor de restricciones, el solucionador y la persistencia son independientes de React. El catálogo y las rutas consumen un registro central. Las miniaturas de cada entidad se vinculan explícitamente con sus pruebas para evitar asociaciones visuales equivocadas.

La interfaz comparte `Header`, catálogo, tarjetas, laboratorio y progreso. `InvestigationPage` integra las fases, el visor accesible, los controles deductivos y la resolución; las variantes de interacción reutilizan el mismo motor.

## Validación

- 40 pruebas unitarias: unicidad de los cinco puzzles, restricciones, estados, referencias visuales, comprobación, persistencia, migración y revelación.
- 15 escenarios de navegador sobre el build de producción: partidas completas de los cinco casos, ayudas, corrección de relaciones, deshacer, almacenamiento, teclado, modales, zoom, comparación, veredictos, navegación y entrega de HTML específico sin JavaScript.
- QA visual en 390×844, 768×1024 y 1440×900: portada, escena, evidencia ampliada, tablero y resolución. Se revisaron las capturas; no hay desbordamiento horizontal de página. La matriz móvil dispone de desplazamiento interno y etiquetas legibles.
- Instalación repetible con `npm ci`, TypeScript y build de producción verificados. El build genera nueve rutas con HTML editorial y metadatos. Las rutas directas sin barra final también sirven el expediente correcto.
- Integración continua preparada en `.github/workflows/ci.yml`; su ejecución remota depende de GitHub Actions y se comprobará allí.

## Despliegue y límites

Ejecuta `npm ci` y `npm run build`; publica `dist/` mediante HTTPS con el tratamiento de rutas descrito en el README. Opcionalmente, define `SITE_URL` con el origen definitivo para generar canonical, Open Graph absoluto, sitemap y robots. No se ha desplegado la aplicación en un alojamiento público ni se ha asignado un dominio.

El progreso reside en el navegador; no se sincroniza entre dispositivos. Los documentos, fechas y lugares del juego son recreaciones educativas, no pruebas de los hechos periodísticos enlazados. La interfaz admite teclado y reducción de movimiento; no se afirma una certificación externa de accesibilidad. El enlace comercial no promete acreditaciones o condiciones no contrastadas.
