# Añadir un expediente

La aplicación obtiene el catálogo, las rutas, los recursos y las investigaciones del registro `src/cases/registry.ts`. No es necesario añadir tarjetas manualmente a la portada.

1. Crea `src/cases/006/case.ts` y exporta un objeto de tipo `Investigation`, siguiendo `src/cases/schema.ts`.
2. Añádelo al registro central. Utiliza un `id` y un `slug` únicos, y marca `published: true` cuando haya pasado las verificaciones.
3. Guarda los recursos locales en `public/assets/cases/006/` e incorpora su procedencia, permisos y naturaleza —documental o recreada— a `docs/ASSETS.md`.
4. Define entre tres y cuatro entidades y el mismo número de categorías. La solución asigna a cada entidad el índice de una categoría, sin repetir ninguna. Por ejemplo, `[2, 0, 1]` asigna la primera entidad a la tercera categoría.
5. Define restricciones a partir de evidencias: `is` fija una relación; `isNot` la excluye; `before` establece orden; `nextTo` exige posiciones consecutivas. Todos los índices empiezan en cero. Cada restricción debe referenciar una evidencia existente.
6. Escribe pistas comprensibles que expresen las restricciones, con tres niveles de ayuda ligados a evidencias. La solución debe poder deducirse del material accesible, sin adivinar.
7. Elige una mecánica: `claims`, `timeline`, `geolocation`, `provenance` o `verification`. Conserva la matriz accesible como alternativa a las interacciones visuales.
8. Añade un veredicto con una única respuesta respaldada por la investigación y explica por qué las otras opciones no están justificadas.
9. Incluye una conclusión, tres pruebas decisivas, una técnica OSINT, los límites de la inferencia y enlaces a fuentes originales. Diferencia la historia real del ejercicio ficticio.

## Recursos visuales

Cada expediente declara `heroImage`, `sceneImage`, `resolutionImage` y de tres a seis evidencias ampliables. Las imágenes deben existir en el directorio `public`, tener texto alternativo contextual y poder interpretarse también mediante la descripción textual. No uses una imagen decorativa como si documentara un hecho.

Los hotspots usan coordenadas porcentuales `x` e `y` sobre la escena. Cada uno referencia una evidencia y ofrece una descripción textual; ninguna pista esencial debe depender de acertar un píxel.

## Verificación

```sh
npm run test
npm run build
npm run test:e2e
```

La suite comprueba que cada puzzle registrado tiene exactamente una solución y coincide con la declarada. Los E2E recorren las fases y completan los expedientes a través de los controles visibles. Revisa el nuevo caso en móvil, tableta y escritorio; adapta el recorrido si incorpora una nueva interacción.

No cambies un puzzle ya publicado sin considerar el progreso guardado. Cambios de reglas pueden necesitar una nueva versión del almacenamiento y una migración que preserve el historial sin conceder victorias automáticamente.

Las miniaturas del tablero se asignan mediante `entityEvidenceIds`, en el orden de `entities`. Enlaza cada fila con la prueba pertinente; no asumas que el orden de la galería coincide con el del tablero.
