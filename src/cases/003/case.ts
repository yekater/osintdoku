import type { Investigation } from "../schema";

const investigation: Investigation = {
  id: "003",
  slug: "estadio-fantasma",
  title: "El estadio fantasma",
  subtitle: "Un fotograma. Cuatro lugares. Una coincidencia.",
  category: "Detectives privados",
  difficulty: "Intermedia",
  estimatedMinutes: 18,
  summary:
    "Una cubierta, una entrada y un canal permiten situar un recinto que nadie reconoce.",
  briefing:
    "Un vídeo ficticio muestra un recinto deportivo sin rótulo legible. Hay cuatro localizaciones candidatas y cuatro perfiles visuales; los nombres de todos los lugares son inventados.",
  objective:
    "Relaciona cada perfil con su localización y encuentra dónde encaja el fotograma A.",
  heroImage: "/assets/cases/003/hero.webp",
  sceneImage: "/assets/cases/003/scene.webp",
  resolutionImage: "/assets/cases/003/resolution.webp",
  mechanic: "geolocation",
  sourceType: "adaptation",
  relatedCourse:
    "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10",
  published: true,
  featured: false,
  visualEvidence: [
    {
      id: "e1",
      title: "Fotograma A: tres módulos",
      type: "Fotograma recreado",
      date: "Observación A",
      image: "/assets/cases/003/evidence-01.png",
      observation:
        "La cubierta tiene tres módulos rectos. Se ve un acceso al oeste y un canal al sur. Esos tres rasgos deben coincidir, no solo el color del edificio.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Inspección de fotogramas",
    },
    {
      id: "e2",
      title: "Fichas Norte y Canal",
      type: "Mapa de candidatos recreado",
      date: "Inventario municipal ficticio",
      image: "/assets/cases/003/evidence-02.png",
      observation:
        "El Pabellón Norte tiene una cubierta curva (foto B). El Campo del Canal tiene una cubierta a dos aguas (foto C). Ninguna coincide con los tres módulos de A.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Comparación arquitectónica",
    },
    {
      id: "e3",
      title: "Ficha de la Vega",
      type: "Imagen aérea recreada",
      date: "Inventario municipal ficticio",
      image: "/assets/cases/003/evidence-03.png",
      observation:
        "El Estadio de la Vega tiene una grada abierta, sin cubierta: corresponde a la foto D.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Lectura de imagen aérea",
    },
    {
      id: "e4",
      title: "Plano del Mirador",
      type: "Plano municipal recreado",
      date: "Inventario municipal ficticio",
      image: "/assets/cases/003/evidence-04.png",
      observation:
        "El Recinto del Mirador presenta tres módulos, acceso por el oeste y canal por el sur. Coinciden las tres características del fotograma A.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Geolocalización por coincidencias",
    },
  ],
  entityEvidenceIds: ["e1", "e2", "e2", "e3"],
  entities: [
    "Foto A · tres módulos",
    "Foto B · curva",
    "Foto C · dos aguas",
    "Foto D · grada abierta",
  ],
  categories: [
    "Pabellón Norte",
    "Campo del Canal",
    "Recinto del Mirador",
    "Estadio de la Vega",
  ],
  logicalClues: [
    {
      id: "c1",
      text: "Los tres módulos de A no encajan con Norte ni con Canal.",
      evidenceId: "e1",
    },
    {
      id: "c2",
      text: "La cubierta curva de B identifica el Pabellón Norte.",
      evidenceId: "e2",
    },
    {
      id: "c3",
      text: "La grada abierta de D corresponde a la Vega.",
      evidenceId: "e3",
    },
    {
      id: "c4",
      text: "Mirador reúne cubierta, acceso y canal; A no es la Vega.",
      evidenceId: "e4",
    },
  ],
  constraints: [
    {
      type: "isNot",
      entity: 0,
      category: 0,
      evidenceId: "e1",
    },
    {
      type: "isNot",
      entity: 0,
      category: 1,
      evidenceId: "e1",
    },
    {
      type: "is",
      entity: 1,
      category: 0,
      evidenceId: "e2",
    },
    {
      type: "is",
      entity: 3,
      category: 3,
      evidenceId: "e3",
    },
    {
      type: "isNot",
      entity: 0,
      category: 3,
      evidenceId: "e4",
    },
  ],
  solution: [2, 0, 1, 3],
  hintLevels: [
    {
      level: 1,
      text: "Compara la forma de la cubierta antes de mirar detalles pequeños.",
      evidenceId: "e1",
    },
    {
      level: 2,
      text: "B ya coincide con Norte y D con la Vega. Solo quedan Canal y Mirador para A y C.",
      evidenceId: "e2",
    },
    {
      level: 3,
      text: "A no tiene cubierta a dos aguas: es Mirador. C corresponde al Campo del Canal.",
      evidenceId: "e4",
    },
  ],
  verdict: {
    question: "¿Dónde se grabó el fotograma A?",
    correctId: "mirador",
    options: [
      {
        id: "norte",
        text: "Pabellón Norte",
        explanation: "Su cubierta curva no coincide con la imagen.",
      },
      {
        id: "canal",
        text: "Campo del Canal",
        explanation: "Tiene cubierta a dos aguas, no tres módulos.",
      },
      {
        id: "mirador",
        text: "Recinto del Mirador",
        explanation:
          "Coinciden los tres módulos, la entrada occidental y el canal meridional.",
      },
      {
        id: "vega",
        text: "Estadio de la Vega",
        explanation:
          "La grada está al aire libre: falta la cubierta del fotograma.",
      },
    ],
  },
  resolution: {
    conclusion:
      "El Recinto del Mirador es la coincidencia respaldada por las tres características relevantes. Una similitud aislada no bastaba; la combinación permite descartar las otras ubicaciones.",
    decisiveEvidence: ["e1", "e2", "e4"],
    technique:
      "Geolocalización visual: extraer rasgos estables, contrastar candidatos y buscar coincidencias independientes.",
    realStory:
      "Bellingcat documentó cómo personas voluntarias localizaron recintos de retransmisiones deportivas. Este puzzle utiliza ese enfoque metodológico con recintos, mapas e imágenes completamente ficticios; no identifica lugares reales del reportaje.",
    uncertainty:
      "La conclusión es válida dentro del conjunto cerrado de candidatos del ejercicio. En una investigación abierta harían falta fuentes independientes y una comprobación adicional.",
  },
  sourceLinks: [
    {
      label: "Bellingcat · geolocalización colaborativa de recintos deportivos",
      url: "https://www.bellingcat.com/news/2024/11/19/volunteers-find-1xbet-stream-sites/",
    },
  ],
  osintTools: [
    {
      name: "OpenStreetMap",
      url: "https://www.openstreetmap.org/",
    },
    {
      name: "Google Earth",
      url: "https://earth.google.com/",
    },
  ],
  hotspots: [
    {
      id: "h1",
      label: "Fotograma A: tres módulos",
      x: 23,
      y: 37,
      evidenceId: "e1",
      detail:
        "La cubierta tiene tres módulos rectos. Se ve un acceso al oeste y un canal al sur. Esos tres rasgos deben coincidir, no solo el color del edificio.",
    },
    {
      id: "h2",
      label: "Fichas Norte y Canal",
      x: 51,
      y: 60,
      evidenceId: "e2",
      detail:
        "El Pabellón Norte tiene una cubierta curva (foto B). El Campo del Canal tiene una cubierta a dos aguas (foto C). Ninguna coincide con los tres módulos de A.",
    },
    {
      id: "h3",
      label: "Ficha de la Vega",
      x: 77,
      y: 34,
      evidenceId: "e3",
      detail:
        "El Estadio de la Vega tiene una grada abierta, sin cubierta: corresponde a la foto D.",
    },
  ],
};

export default investigation;
