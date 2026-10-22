import type { Investigation } from "../schema";

const investigation: Investigation = {
  id: "004",
  slug: "fotografia-imposible",
  title: "La fotografía imposible",
  subtitle: "Una imagen antigua. Cuatro fechas. Ninguna firma.",
  category: "Estudiantes",
  difficulty: "Avanzada",
  estimatedMinutes: 20,
  summary:
    "La fecha de digitalización no es la fecha de una fotografía. Reconstruye su recorrido.",
  briefing:
    "Una imagen recreada de un ensayo térmico sobre un tejado circula con atribuciones contradictorias. Un álbum, una publicación técnica, un recorte y una ficha digital conservan distintas etapas de su recorrido.",
  objective:
    "Ordena la cadena documental y establece qué puedes saber del origen sin inventar una autoría.",
  heroImage: "/assets/cases/004/hero.webp",
  sceneImage: "/assets/cases/004/scene.webp",
  resolutionImage: "/assets/cases/004/resolution.webp",
  mechanic: "provenance",
  sourceType: "adaptation",
  relatedCourse:
    "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10",
  published: true,
  featured: false,
  visualEvidence: [
    {
      id: "e1",
      title: "Copia del álbum",
      type: "Fotografía de archivo recreada",
      date: "1882",
      image: "/assets/cases/004/evidence-01.png",
      observation:
        "El álbum ficticio está fechado en 1882. Conserva el encuadre más amplio: tuberías sobre un tejado y un borde de papel completo.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Crítica de fuentes",
    },
    {
      id: "e2",
      title: "Publicación técnica",
      type: "Página bibliográfica recreada",
      date: "1884",
      image: "/assets/cases/004/evidence-02.png",
      observation:
        "La publicación de 1884 reproduce el mismo tejado. Es el siguiente hito después del álbum y anterior al recorte; no incluye nombre de fotógrafo.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Verificación bibliográfica",
    },
    {
      id: "e3",
      title: "Recorte sin firma",
      type: "Recorte editorial recreado",
      date: "1906",
      image: "/assets/cases/004/evidence-03.png",
      observation:
        "El recorte fechado en 1906 elimina los bordes de la imagen. Su publicación posterior no convierte 1906 en la fecha de toma.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Comparación de encuadres",
    },
    {
      id: "e4",
      title: "Ficha digital del catálogo",
      type: "Ficha de catálogo recreada",
      date: "2019",
      image: "/assets/cases/004/evidence-04.png",
      observation:
        "El campo «digitalización» indica 2019. Describe la creación del archivo digital, no la captura de la fotografía ni el ensayo representado.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Lectura de metadatos",
    },
  ],
  entityEvidenceIds: ["e4", "e3", "e1", "e2"],
  entities: [
    "Ficha digital",
    "Recorte sin firma",
    "Copia del álbum",
    "Publicación técnica",
  ],
  categories: ["1882", "1884", "1906", "2019"],
  logicalClues: [
    {
      id: "c1",
      text: "La copia del álbum es de 1882.",
      evidenceId: "e1",
    },
    {
      id: "c2",
      text: "La publicación técnica es el siguiente hito después del álbum y precede al recorte.",
      evidenceId: "e2",
    },
    {
      id: "c3",
      text: "El recorte es una publicación impresa anterior a la ficha digital.",
      evidenceId: "e3",
    },
    {
      id: "c4",
      text: "2019 corresponde a la digitalización, no a la toma original.",
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
      type: "before",
      first: 3,
      second: 1,
      evidenceId: "e2",
    },
    {
      type: "nextTo",
      first: 2,
      second: 3,
      evidenceId: "e2",
    },
    {
      type: "isNot",
      entity: 1,
      category: 3,
      evidenceId: "e3",
    },
    {
      type: "is",
      entity: 0,
      category: 3,
      evidenceId: "e4",
    },
  ],
  solution: [3, 2, 0, 1],
  hintLevels: [
    {
      level: 1,
      text: "Distingue los campos «publicación» y «digitalización». No describen el mismo acontecimiento.",
      evidenceId: "e4",
    },
    {
      level: 2,
      text: "Entre el álbum de 1882 y la digitalización de 2019 van la publicación técnica y después el recorte.",
      evidenceId: "e2",
    },
    {
      level: 3,
      text: "La publicación técnica es de 1884; el recorte, de 1906. La autoría sigue sin constar.",
      evidenceId: "e3",
    },
  ],
  verdict: {
    question: "¿Cuál es la atribución mejor respaldada?",
    correctId: "limited",
    options: [
      {
        id: "digital",
        text: "La fotografía se tomó en 2019.",
        explanation: "Esa es la fecha del archivo digital, no la de la imagen.",
      },
      {
        id: "clipping",
        text: "El recorte de 1906 es el original y prueba quién hizo la foto.",
        explanation: "Hay una copia anterior y el recorte no está firmado.",
      },
      {
        id: "limited",
        text: "La imagen consta en un álbum de 1882; la autoría no está acreditada.",
        explanation:
          "Distingue la copia documentada más antigua del momento de toma y de la identidad del autor.",
      },
      {
        id: "first",
        text: "Demuestra el primer panel solar del mundo.",
        explanation:
          "El ejercicio no aporta pruebas suficientes para una afirmación mundial ni para esa terminología técnica.",
      },
    ],
  },
  resolution: {
    conclusion:
      "La copia más antigua del expediente figura en el álbum de 1882. La publicación de 1884, el recorte de 1906 y la ficha de 2019 son reutilizaciones o nuevas formas de conservación. No consta una autoría verificable.",
    decisiveEvidence: ["e1", "e2", "e4"],
    technique:
      "Investigación de procedencia: reconstruir la cadena de publicaciones, comparar encuadres y distinguir creación, reproducción y digitalización.",
    realStory:
      "La investigación de Bellingcat sobre una fotografía relacionada con los primeros captadores solares inspira la búsqueda de procedencia. La imagen del tejado, el álbum y todas las fechas de este puzzle son recreaciones ficticias y no documentan aquella investigación.",
    uncertainty:
      "Una copia fechada marca el límite más tardío posible para la existencia de esa imagen; no fija necesariamente el día de la toma ni demuestra quién la hizo.",
  },
  sourceLinks: [
    {
      label:
        "Bellingcat · el misterio de una fotografía sobre los primeros captadores solares",
      url: "https://www.bellingcat.com/news/2023/08/16/untangling-the-mystery-of-the-worlds-first-rooftop-solar-panel/",
    },
  ],
  osintTools: [
    {
      name: "Europeana",
      url: "https://www.europeana.eu/es",
    },
    {
      name: "Internet Archive",
      url: "https://archive.org/",
    },
  ],
  hotspots: [
    {
      id: "h1",
      label: "Copia del álbum",
      x: 23,
      y: 37,
      evidenceId: "e1",
      detail:
        "El álbum ficticio está fechado en 1882. Conserva el encuadre más amplio: tuberías sobre un tejado y un borde de papel completo.",
    },
    {
      id: "h2",
      label: "Publicación técnica",
      x: 51,
      y: 60,
      evidenceId: "e2",
      detail:
        "La publicación de 1884 reproduce el mismo tejado. Es el siguiente hito después del álbum y anterior al recorte; no incluye nombre de fotógrafo.",
    },
    {
      id: "h3",
      label: "Recorte sin firma",
      x: 77,
      y: 34,
      evidenceId: "e3",
      detail:
        "El recorte fechado en 1906 elimina los bordes de la imagen. Su publicación posterior no convierte 1906 en la fecha de toma.",
    },
  ],
};

export default investigation;
