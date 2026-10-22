import type { Investigation } from "../schema";

const investigation: Investigation = {
  id: "001",
  slug: "mapa-de-las-pistas",
  title: "El mapa de las pistas",
  subtitle: "Diez años de experiencia. ¿Diez años de pruebas?",
  category: "OSINT Framework",
  difficulty: "Inicial",
  estimatedMinutes: 12,
  summary:
    "Una empresa presume de una larga trayectoria. Su huella digital cuenta otra historia.",
  briefing:
    "En 2024, la consultora ficticia Norte Analítica afirma trabajar desde 2014. Antes de recomendarla, necesitas separar sus promesas de los datos contrastables.",
  objective:
    "Reconstruye cuatro hitos y decide qué afirmación respalda realmente el archivo.",
  heroImage: "/assets/cases/001/hero.webp",
  sceneImage: "/assets/cases/001/scene.webp",
  resolutionImage: "/assets/cases/001/resolution.webp",
  mechanic: "claims",
  sourceType: "simulation",
  relatedCourse:
    "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10",
  published: true,
  featured: true,
  visualEvidence: [
    {
      id: "e1",
      title: "Alta de la sociedad",
      type: "Documento societario",
      date: "2018",
      image: "/assets/cases/001/evidence-01.png",
      observation:
        "La sociedad ficticia se constituye en 2018. Una fecha de constitución no demuestra por sí sola actividad previa ni posterior.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Consulta registral",
    },
    {
      id: "e2",
      title: "Registro del dominio",
      type: "Registro de dominio",
      date: "2020",
      image: "/assets/cases/001/evidence-02.png",
      observation:
        "El dominio norteanalitica.example se registra en 2020. El alta de un dominio no equivale a la fundación de una empresa.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "RDAP",
    },
    {
      id: "e3",
      title: "Primera captura conservada",
      type: "Archivo web",
      date: "2021",
      image: "/assets/cases/001/evidence-03.png",
      observation:
        "La primera captura disponible es de 2021, el siguiente hito de la secuencia después del registro del dominio. No hallar una captura anterior no prueba que nunca existiera una web.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Archivo web",
    },
    {
      id: "e4",
      title: "Una referencia independiente",
      type: "Boletín recreado",
      date: "2023",
      image: "/assets/cases/001/evidence-04.png",
      observation:
        "Una publicación externa de 2023 menciona un trabajo de la consultora. Es la única referencia de cliente que contiene este expediente.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Contraste de fuentes",
    },
  ],
  entityEvidenceIds: ["e3", "e4", "e1", "e2"],
  entities: [
    "Primera web archivada",
    "Referencia del cliente",
    "Alta de la sociedad",
    "Registro del dominio",
  ],
  categories: ["2018", "2020", "2021", "2023"],
  logicalClues: [
    {
      id: "c1",
      text: "La sociedad consta desde 2018; no confundas ese dato con la edad del dominio.",
      evidenceId: "e1",
    },
    {
      id: "c2",
      text: "El registro del dominio no es el último hito de la secuencia.",
      evidenceId: "e2",
    },
    {
      id: "c3",
      text: "La captura conservada es el siguiente hito después del registro del dominio.",
      evidenceId: "e3",
    },
    {
      id: "c4",
      text: "La referencia independiente es de 2023.",
      evidenceId: "e4",
    },
  ],
  constraints: [
    {
      type: "is",
      entity: 2,
      category: 0,
      evidenceId: "e1",
    },
    {
      type: "isNot",
      entity: 3,
      category: 3,
      evidenceId: "e2",
    },
    {
      type: "before",
      first: 3,
      second: 0,
      evidenceId: "e3",
    },
    {
      type: "nextTo",
      first: 3,
      second: 0,
      evidenceId: "e3",
    },
    {
      type: "is",
      entity: 1,
      category: 3,
      evidenceId: "e4",
    },
  ],
  solution: [2, 3, 0, 1],
  hintLevels: [
    {
      level: 1,
      text: "Empieza por las dos fechas que aparecen expresamente en el documento societario y el boletín.",
      evidenceId: "e1",
    },
    {
      level: 2,
      text: "Con 2018 y 2023 asignados, solo quedan dos posiciones para dominio y captura.",
      evidenceId: "e3",
    },
    {
      level: 3,
      text: "El dominio corresponde a 2020 y la captura a 2021; el orden importa.",
      evidenceId: "e2",
    },
  ],
  verdict: {
    question: "¿Qué puedes afirmar sobre Norte Analítica?",
    correctId: "supported",
    options: [
      {
        id: "ten-years",
        text: "Está demostrada su actividad desde 2014.",
        explanation: "Ninguna evidencia del expediente acredita 2014.",
      },
      {
        id: "supported",
        text: "Hay hitos documentados desde 2018; la trayectoria desde 2014 no está acreditada.",
        explanation:
          "Es la conclusión que respeta tanto las pruebas como sus límites.",
      },
      {
        id: "fraud",
        text: "La ausencia de capturas antiguas demuestra un fraude.",
        explanation:
          "La ausencia en un archivo no demuestra un delito ni permite atribuir intención.",
      },
      {
        id: "clients",
        text: "Todos sus grandes clientes están verificados.",
        explanation: "Solo existe una referencia externa en este expediente.",
      },
    ],
  },
  resolution: {
    conclusion:
      "La huella disponible empieza en 2018. El dominio es de 2020, la web conservada de 2021 y la referencia externa de 2023. La promesa de actividad desde 2014 queda sin acreditar.",
    decisiveEvidence: ["e1", "e3", "e4"],
    technique:
      "Verificación corporativa: distinguir fechas registrales, técnicas y editoriales antes de construir una cronología.",
    realStory:
      "Este expediente es una simulación completa. OSINT Framework es un directorio de recursos para orientar búsquedas; no certifica empresas ni sustituye el contraste de fuentes.",
    uncertainty:
      "Sin más fuentes no podemos determinar si hubo actividad anterior, ni atribuir engaño a la empresa ficticia.",
  },
  sourceLinks: [
    {
      label: "OSINT Framework · directorio educativo",
      url: "https://osintframework.com/",
    },
  ],
  osintTools: [
    {
      name: "OSINT Framework",
      url: "https://osintframework.com/",
    },
    {
      name: "Internet Archive",
      url: "https://web.archive.org/",
    },
    {
      name: "ICANN Lookup",
      url: "https://lookup.icann.org/",
    },
  ],
  hotspots: [
    {
      id: "h1",
      label: "Alta de la sociedad",
      x: 23,
      y: 37,
      evidenceId: "e1",
      detail:
        "La sociedad ficticia se constituye en 2018. Una fecha de constitución no demuestra por sí sola actividad previa ni posterior.",
    },
    {
      id: "h2",
      label: "Registro del dominio",
      x: 51,
      y: 60,
      evidenceId: "e2",
      detail:
        "El dominio norteanalitica.example se registra en 2020. El alta de un dominio no equivale a la fundación de una empresa.",
    },
    {
      id: "h3",
      label: "Primera captura conservada",
      x: 77,
      y: 34,
      evidenceId: "e3",
      detail:
        "La primera captura disponible es de 2021, el siguiente hito de la secuencia después del registro del dominio. No hallar una captura anterior no prueba que nunca existiera una web.",
    },
  ],
};

export default investigation;
