import type { Investigation } from "../schema";

const investigation: Investigation = {
  id: "002",
  slug: "terreno-en-disputa",
  title: "El terreno en disputa",
  subtitle: "La tierra no habla. Las imágenes, sí.",
  category: "Abogados",
  difficulty: "Intermedia",
  estimatedMinutes: 16,
  summary:
    "Cuatro observaciones de una parcela. Una cronología que puede cambiar una investigación.",
  briefing:
    "Una controversia ficticia gira en torno al uso de una parcela. Dispones de cuatro observaciones recreadas de 2024, pero una imagen no identifica automáticamente a quien realizó los trabajos.",
  objective:
    "Ordena los cambios visibles y diferencia una observación de una conclusión jurídica.",
  heroImage: "/assets/cases/002/hero.webp",
  sceneImage: "/assets/cases/002/scene.webp",
  resolutionImage: "/assets/cases/002/resolution.webp",
  mechanic: "timeline",
  sourceType: "adaptation",
  relatedCourse:
    "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10",
  published: true,
  featured: false,
  visualEvidence: [
    {
      id: "e1",
      title: "Parcela sin actividad",
      type: "Imagen satelital recreada",
      date: "Febrero de 2024",
      image: "/assets/cases/002/evidence-01.png",
      observation:
        "La parcela conserva vegetación continua y no muestra accesos nuevos. Es la observación más temprana del expediente.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Comparación multitemporal",
    },
    {
      id: "e2",
      title: "Aparece un acceso",
      type: "Imagen satelital recreada",
      date: "Abril de 2024",
      image: "/assets/cases/002/evidence-02.png",
      observation:
        "Un camino nuevo entra por el oeste. Su apertura precede a la aparición de acopios.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Comparación de imágenes",
    },
    {
      id: "e3",
      title: "Materiales sobre el terreno",
      type: "Imagen satelital recreada",
      date: "Junio de 2024",
      image: "/assets/cases/002/evidence-03.png",
      observation:
        "Se ven acopios rectangulares junto al camino. Es la siguiente observación después del acceso abierto.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Análisis visual",
    },
    {
      id: "e4",
      title: "Retirada de los acopios",
      type: "Croquis comparativo",
      date: "Agosto de 2024",
      image: "/assets/cases/002/evidence-04.png",
      observation:
        "Los materiales ya no son visibles en la última imagen de la serie. El perímetro de la parcela permanece igual.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Documentación de cambios",
    },
  ],
  entityEvidenceIds: ["e3", "e1", "e2", "e4"],
  entities: [
    "Zona con acopios",
    "Parcela sin cambios",
    "Acceso abierto",
    "Terreno despejado",
  ],
  categories: ["Febrero", "Abril", "Junio", "Agosto"],
  logicalClues: [
    {
      id: "c1",
      text: "La parcela sin cambios abre la serie en febrero.",
      evidenceId: "e1",
    },
    {
      id: "c2",
      text: "El acceso existe antes de que aparezcan los acopios.",
      evidenceId: "e2",
    },
    {
      id: "c3",
      text: "Los acopios aparecen en la observación inmediatamente posterior al acceso.",
      evidenceId: "e3",
    },
    {
      id: "c4",
      text: "En agosto los acopios ya no son visibles.",
      evidenceId: "e4",
    },
  ],
  constraints: [
    {
      type: "is",
      entity: 1,
      category: 0,
      evidenceId: "e1",
    },
    {
      type: "before",
      first: 2,
      second: 0,
      evidenceId: "e2",
    },
    {
      type: "nextTo",
      first: 2,
      second: 0,
      evidenceId: "e3",
    },
    {
      type: "is",
      entity: 3,
      category: 3,
      evidenceId: "e4",
    },
  ],
  solution: [2, 0, 1, 3],
  hintLevels: [
    {
      level: 1,
      text: "Busca las dos observaciones que delimitan el principio y el final.",
      evidenceId: "e1",
    },
    {
      level: 2,
      text: "El acceso debe aparecer antes de los materiales, no después.",
      evidenceId: "e2",
    },
    {
      level: 3,
      text: "Asigna abril al acceso y junio a los acopios. Agosto corresponde a la retirada visible.",
      evidenceId: "e3",
    },
  ],
  verdict: {
    question: "¿Qué demuestra esta secuencia visual?",
    correctId: "changes",
    options: [
      {
        id: "liability",
        text: "La responsabilidad jurídica de una empresa concreta.",
        explanation:
          "Las imágenes no identifican a los responsables ni establecen por sí solas una infracción.",
      },
      {
        id: "changes",
        text: "Cambios visibles entre febrero y agosto, sin determinar quién los realizó.",
        explanation:
          "Describe los hechos observables sin añadir una atribución que no está probada.",
      },
      {
        id: "never",
        text: "Que nunca hubo actividad en la parcela.",
        explanation: "Las observaciones de abril y junio muestran cambios.",
      },
      {
        id: "ownership",
        text: "Que los materiales pertenecen al propietario del terreno.",
        explanation:
          "Ni el aspecto ni la ubicación demuestran la propiedad de los materiales.",
      },
    ],
  },
  resolution: {
    conclusion:
      "Primero aparece un acceso, después los acopios y finalmente su retirada. Puedes documentar los cambios y acotar sus fechas; no atribuir automáticamente autoría o responsabilidad jurídica.",
    decisiveEvidence: ["e1", "e2", "e3"],
    technique:
      "Análisis multitemporal de imágenes: comparar una misma zona, conservar la procedencia y separar hechos observados de inferencias.",
    realStory:
      "La investigación de Bellingcat sobre el litigio entre SpaceX y Cards Against Humanity inspira el método de comparar imágenes satelitales. Esta parcela, sus cuatro fechas y sus documentos son una adaptación educativa ficticia, no material del litigio.",
    uncertainty:
      "Una imagen por fecha solo acota intervalos. No muestra todo lo ocurrido entre capturas ni identifica a quienes actuaron.",
  },
  sourceLinks: [
    {
      label: "Bellingcat · imágenes satelitales en un litigio sobre terrenos",
      url: "https://www.bellingcat.com/news/2024/10/22/spacex-vs-cards-against-humanity-satellite-imagery-shows-activity-on-land-at-centre-of-legal-case/",
    },
  ],
  osintTools: [
    {
      name: "Copernicus Browser",
      url: "https://browser.dataspace.copernicus.eu/",
    },
    {
      name: "Google Earth",
      url: "https://earth.google.com/",
    },
  ],
  hotspots: [
    {
      id: "h1",
      label: "Parcela sin actividad",
      x: 23,
      y: 37,
      evidenceId: "e1",
      detail:
        "La parcela conserva vegetación continua y no muestra accesos nuevos. Es la observación más temprana del expediente.",
    },
    {
      id: "h2",
      label: "Aparece un acceso",
      x: 51,
      y: 60,
      evidenceId: "e2",
      detail:
        "Un camino nuevo entra por el oeste. Su apertura precede a la aparición de acopios.",
    },
    {
      id: "h3",
      label: "Materiales sobre el terreno",
      x: 77,
      y: 34,
      evidenceId: "e3",
      detail:
        "Se ven acopios rectangulares junto al camino. Es la siguiente observación después del acceso abierto.",
    },
  ],
};

export default investigation;
