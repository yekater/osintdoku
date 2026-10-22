# Auditoría inicial

El repositorio seleccionado, `yekater/osintdoku`, estaba vacío al iniciar la implementación: no contenía archivos de aplicación, commits ni ramas remotas. El `HEAD` local era una rama sin commits. La lectura del remoto mediante Git funcionaba.

Por tanto, no existían una versión anterior que refactorizar, funciones `openCase`/`check`, fuentes locales ni ficheros que respaldar. Se creó una aplicación nueva, sin sustituir código previo. El PDF «OSINTDOKU V5 — MASTER IMPLEMENTATION PROMPT» se utilizó como especificación funcional y editorial.

## Decisiones

- React y TypeScript estricto para la interfaz; Vite para desarrollo y build estático.
- Datos de cada expediente separados del motor y de su presentación.
- Un motor de restricciones con solución biyectiva, comprobación automática de unicidad y pruebas.
- Interacciones especializadas para afirmaciones, cronología, geolocalización, procedencia y contexto de publicaciones.
- Progreso local versionado. Los resultados de versiones antiguas no conceden victorias en los nuevos juegos.
- Reconstrucciones didácticas identificadas expresamente. Los enlaces periodísticos son fuentes de inspiración, no la procedencia de los documentos ficticios del puzzle.
- Sin backend, cuenta obligatoria, credenciales ni base de datos. No se solicita información personal del jugador.

## Límites editoriales

Los cinco puzzles son ejercicios educativos. Las fechas, ubicaciones candidatas, empresas y documentos recreados sirven al juego; no establecen hechos sobre las personas u organizaciones de las investigaciones originales. No se deduce responsabilidad jurídica de una imagen satelital ni se afirma que una ausencia de registro pruebe una falsedad.

La formación enlaza a Perinfor. La aplicación no atribuye a ese curso acreditaciones, precios, duración ni reconocimiento administrativo no verificados.
