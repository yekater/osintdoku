# Procedencia y uso de los recursos visuales

Todos los recursos de `public/assets/` se han creado para OSINTDOKU. No se han descargado fotografías de prensa, imágenes de conflictos, mapas comerciales ni retratos de personas reales. Los enlaces periodísticos de los expedientes sirven como inspiración metodológica: no son la procedencia de las imágenes del juego.

## Fotografías de ambientación

Creadas con **OpenAI image_gen**, mediante descripciones originales, para este proyecto. Hay nueve imágenes fotográficas originales: seis de ambientación y tres para inspección/comparación. Las composiciones, los lugares y los documentos que aparecen en ellas son ficticios. No se utilizan como pruebas históricas. El resultado se ha convertido de PNG a WebP, sin modificar su contenido, para reducir el peso de las páginas.

| Recurso | Contenido | Procedencia |
| --- | --- | --- |
| `hero.webp` | Mesa de investigación, mapa y archivo; investigador anónimo de espaldas | Generación original: `exec-78004ea4-7d54-4737-94c6-823b553967b3.png` |
| `cases/001/hero.webp` | Mesa de diligencia corporativa y ventana nocturna | Generación original: `exec-2513763c-d624-41ad-9770-b5cdb7165f56.png` |
| `cases/002/hero.webp` | Parcela industrial ficticia vista desde el aire | Generación original: `exec-90d8f740-b647-432c-b9be-4ddcfa74ec79.png` |
| `cases/003/hero.webp` | Recinto deportivo ficticio con cubierta segmentada y puerta azul | Generación original: `exec-cdac7f67-9724-456a-a2da-94e08217d635.png` |
| `cases/004/hero.webp` | Recreación de un antiguo experimento solar en una cubierta | Generación original: `exec-04efd1e3-81ac-4802-af16-0cd985feeafb.png` |
| `cases/005/hero.webp` | Redacción ficticia analizando una imagen urbana no gráfica | Generación original: `exec-e3f25abf-c2bf-4c36-b9fa-a93edddc977c.png` |

Cada `cases/00N/resolution.webp` reutiliza la portada correspondiente. No representa una prueba nueva. Los originales de generación se conservan fuera del repositorio en `/workspace/generated_images/`; no son necesarios para construir o ejecutar la aplicación.

## Pruebas y escenas didácticas

**Creación gráfica original del proyecto**, dibujada con Pillow y las tipografías Manrope y Space Grotesk (SIL OFL 1.1), y exportada como imágenes rasterizadas. Los documentos no reproducen sellos, firmas ni credenciales oficiales. Cada archivo lleva una advertencia visible: «RECREACIÓN DIDÁCTICA» y «SIN VALOR DOCUMENTAL» o «TODAS LAS PRUEBAS SON FICTICIAS».

| Directorio | `evidence-01.png` | `evidence-02.png` | `evidence-03.png` | `evidence-04.png` |
| --- | --- | --- | --- | --- |
| `cases/001/` | Alta ficticia de Norte Analítica, 2018 | Dominio `.example`, 2020 | Captura de archivo, 2021 | Referencia externa, 2023 |
| `cases/002/` | Parcela intacta, febrero | Acceso oeste, abril | Acopios, junio | Terreno despejado, agosto |
| `cases/003/` | Cubierta de tres módulos, acceso oeste, canal sur | Comparación Norte/Canal | Vega sin cubierta | Plano ficticio del Mirador |
| `cases/004/` | Copia de álbum, 1882 | Publicación técnica, 1884 | Recorte posterior, 1906 | Digitalización, 2019 |
| `cases/005/` | Mensaje viral, 04/10/2024 | Archivo de Puerto Gris, 2016 | Reedición, 2020 | Verificación, 06/10/2024 |

Los `scene.webp` de los casos 001, 002, 004 y 005 son gráficos independientes que resumen las pruebas del propio expediente. El caso 002 muestra tres observaciones de la misma parcela; los demás muestran las fechas o documentos de la investigación. El croquis arquitectónico original del caso 003 se conserva como `cases/003/site-map.webp`.

La escena de inspección del caso 003 y las dos imágenes del comparador del caso 002 son **fotografías sintéticas generadas**, no fotografías originales de los hechos periodísticos enlazados. Deben conservar su etiqueta visible de recreación en la interfaz.

| Recurso adicional | Contenido verificable dentro del ejercicio | Generación original |
| --- | --- | --- |
| `cases/003/scene.webp` | Recinto deportivo ficticio, tres cubiertas segmentadas, puerta azul y canal | `exec-a5ccc8dd-d6c0-419a-bd02-9ec6d1646d93.png`, edición generativa de la portada ficticia |
| `cases/002/before.webp` | Parcela rectangular sin acceso ni acopios; carretera oeste, árbol noreste y roca suroeste | `exec-ee08e408-61ff-4a4d-8a16-14338551c2d8.png`, generación original |
| `cases/002/after.webp` | Misma parcela y encuadre: nuevo acceso por el oeste y tres acopios al este | `exec-8ed8cc55-ba50-4712-a54c-18eedb5bf5b1.png`, edición generativa de la imagen anterior |

El par antes/después mantiene el encuadre y los hitos de referencia para permitir una comparación visual; al ser una recreación generada, no sirve para medir cambios reales de una parcela. La escena deportiva permite observar rasgos visuales; las referencias cardinales de la deducción se documentan en el croquis recreado, no se infieren de la iluminación de la fotografía.

Las formas de las pruebas (parcelas, tejados, almacén con tres ventanas y torre de agua) están dibujadas para que el jugador pueda comprobar las relaciones del puzzle. Las entidades, fechas y localizaciones inventadas no se atribuyen a personas o empresas reales.

## Licencia

Las fotografías y los gráficos son recursos originales incorporados al proyecto. Las tipografías de terceros mantienen sus avisos y su propia licencia, detallada a continuación. Se distribuyen con la licencia MIT del repositorio; las imágenes generadas están asimismo sujetas a los términos aplicables del servicio de generación. No se afirma exclusividad ni condición de documento auténtico. Las fuentes periodísticas conservan sus propios derechos: se enlazan, no se redistribuyen.


## Tipografías

- **Manrope**, Copyright 2019 The Manrope Project Authors ([proyecto](https://github.com/sharanda/manrope)). Distribuida mediante `@fontsource/manrope` bajo **SIL Open Font License 1.1**. Se utiliza en la interfaz y para rasterizar los textos de las pruebas.
- **Space Grotesk**, Copyright 2020 The Space Grotesk Project Authors ([proyecto](https://github.com/floriankarsten/space-grotesk)). Distribuida mediante `@fontsource/space-grotesk` bajo **SIL Open Font License 1.1**. Se utiliza en titulares y metadatos.

Las fuentes se sirven localmente; no se llama a Google Fonts. Sus licencias se conservan en los paquetes npm y se distribuyen en `public/licenses/`. Los archivos de fuentes no se relicencian bajo MIT; los documentos rasterizados creados con ellas se distribuyen con la licencia del proyecto, tal como permite la OFL.

## Referencias de los marcadores

Los puntos de inspección se expresan como porcentajes aproximados de la imagen original (origen arriba a la izquierda); el panel de observaciones ofrece la misma información con controles de texto accesibles. En la escena fotográfica 003: la cubierta segmentada se observa en torno a `x=53 %, y=22 %`, la puerta azul en torno a `x=36 %, y=49 %` y el canal en torno a `x=50 %, y=80 %`. El croquis separado documenta los puntos cardinales de la ficción. En las escenas de documentos 001/004/005, las tarjetas se sitúan en torno a `x=19/51/83 %`, con centro a `y=52/57/52 %`. En la comparación 002 se conserva el encuadre para que el acceso oeste y los acopios puedan inspeccionarse sin que cambien los límites de la parcela.
