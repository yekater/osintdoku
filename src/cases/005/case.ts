import type { Investigation } from "../schema";

const investigation: Investigation = {
  id: "005",
  slug: "la-noticia-que-nunca-ocurrio",
  title: "La noticia que nunca ocurrió",
  subtitle: "La fotografía es real. El pie de foto, no.",
  category: "Periodistas",
  difficulty: "Avanzada",
  estimatedMinutes: 18,
  summary:
    "Una publicación asegura mostrar un suceso reciente. La misma imagen ya estaba en un archivo.",
  briefing:
    "El 4 de octubre de 2024, un mensaje ficticio atribuye una imagen a un suceso ocurrido «hoy en Bahía Sur». Tu redacción localiza versiones anteriores. Las localidades y publicaciones del ejercicio son inventadas; no se muestran imágenes de víctimas.",
  objective:
    "Reconstruye la procedencia de la fotografía y decide qué puede publicar la redacción.",
  heroImage: "/assets/cases/005/hero.webp",
  sceneImage: "/assets/cases/005/scene.webp",
  resolutionImage: "/assets/cases/005/resolution.webp",
  mechanic: "verification",
  sourceType: "adaptation",
  relatedCourse:
    "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10",
  published: true,
  featured: false,
  visualEvidence: [
    {
      id: "e1",
      title: "El mensaje viral",
      type: "Publicación recreada",
      date: "4 de octubre de 2024",
      image: "/assets/cases/005/evidence-01.png",
      observation:
        "El mensaje dice «hoy en Bahía Sur». La verificación editorial se publica dos días después. El pie de foto es una afirmación que hay que contrastar.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Análisis de publicaciones",
    },
    {
      id: "e2",
      title: "La fuente anterior",
      type: "Archivo municipal recreado",
      date: "2016",
      image: "/assets/cases/005/evidence-02.png",
      observation:
        "El archivo ficticio de Puerto Gris conserva la misma escena en 2016: tres ventanas y un depósito de agua permiten comprobar la coincidencia.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Búsqueda inversa",
    },
    {
      id: "e3",
      title: "Una reedición sin contexto",
      type: "Captura archivada recreada",
      date: "2020",
      image: "/assets/cases/005/evidence-03.png",
      observation:
        "Una versión recortada circula en 2020, después del archivo original y antes del mensaje viral. El recorte conserva las tres ventanas.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Archivo web",
    },
    {
      id: "e4",
      title: "La comparación editorial",
      type: "Informe de verificación recreado",
      date: "6 de octubre de 2024",
      image: "/assets/cases/005/evidence-04.png",
      observation:
        "La comparación de ventanas, tejado y depósito vincula las tres imágenes. El informe de 2024 contextualiza la fotografía anterior; no prueba un suceso nuevo.",
      provenance:
        "Recreación educativa original de OSINTDOKU. Los nombres, las fechas y los documentos del puzzle son ficticios; no son pruebas del caso periodístico.",
      status: "recreada",
      tool: "Verificación de imágenes",
    },
  ],
  entityEvidenceIds: ["e1", "e2", "e4", "e3"],
  entities: [
    "Mensaje viral",
    "Archivo municipal",
    "Artículo de verificación",
    "Reedición sin contexto",
  ],
  categories: [
    "Original de 2016",
    "Recirculación de 2020",
    "Atribución falsa de 2024",
    "Desmentido de 2024",
  ],
  logicalClues: [
    {
      id: "c1",
      text: "El mensaje viral aparece antes que el artículo de verificación.",
      evidenceId: "e1",
    },
    {
      id: "c2",
      text: "El archivo municipal contiene la versión de 2016.",
      evidenceId: "e2",
    },
    {
      id: "c3",
      text: "La reedición es posterior al original y anterior al mensaje viral.",
      evidenceId: "e3",
    },
    {
      id: "c4",
      text: "El desmentido cierra la cadena de publicaciones.",
      evidenceId: "e4",
    },
  ],
  constraints: [
    {
      type: "before",
      first: 0,
      second: 2,
      evidenceId: "e1",
    },
    {
      type: "is",
      entity: 1,
      category: 0,
      evidenceId: "e2",
    },
    {
      type: "before",
      first: 3,
      second: 0,
      evidenceId: "e3",
    },
    {
      type: "is",
      entity: 2,
      category: 3,
      evidenceId: "e4",
    },
  ],
  solution: [2, 0, 3, 1],
  hintLevels: [
    {
      level: 1,
      text: "Una imagen anterior a un suceso no puede documentar ese suceso reciente.",
      evidenceId: "e2",
    },
    {
      level: 2,
      text: "Sitúa el archivo en 2016 y el desmentido al final. La reedición precede al mensaje viral.",
      evidenceId: "e3",
    },
    {
      level: 3,
      text: "El orden es archivo → reedición → mensaje viral → verificación. La atribución a «hoy» queda refutada.",
      evidenceId: "e4",
    },
  ],
  verdict: {
    question: "¿Publicarías la noticia con el pie de foto viral?",
    correctId: "context",
    options: [
      {
        id: "publish",
        text: "Sí, la publicaría tal como está.",
        explanation:
          "La fotografía ya existía en 2016 y no documenta el supuesto suceso reciente.",
      },
      {
        id: "context",
        text: "Publicaría una verificación contextualizada, sin repetir la atribución falsa como un hecho.",
        explanation:
          "La cadena documental permite explicar que se ha reutilizado una imagen anterior.",
      },
      {
        id: "fake",
        text: "Diría que la fotografía es necesariamente sintética.",
        explanation:
          "Un contexto falso no demuestra que una fotografía haya sido generada o manipulada.",
      },
      {
        id: "ignore",
        text: "Afirmaría que en Bahía Sur nunca ocurrió ningún suceso.",
        explanation:
          "La comprobación refuta esta atribución de imagen, no todos los posibles acontecimientos del lugar.",
      },
    ],
  },
  resolution: {
    conclusion:
      "La escena figura en un archivo de 2016 y en una reedición de 2020. No puede probar lo que el mensaje asegura que ocurrió «hoy» en 2024. La respuesta editorial respaldada es una verificación que restituya el contexto.",
    decisiveEvidence: ["e1", "e2", "e4"],
    technique:
      "Verificación de contexto: buscar apariciones anteriores, comparar rasgos de la imagen y fechar cada publicación por separado.",
    realStory:
      "Bellingcat investigó la reutilización de imágenes de Siria con atribuciones engañosas durante el conflicto en Gaza. La calle, las localidades, las fechas y los mensajes de este ejercicio son ficticios; no son imágenes ni publicaciones de ese reportaje.",
    uncertainty:
      "La primera aparición encontrada no garantiza ser la primera publicación absoluta. Aquí basta para refutar la atribución temporal del mensaje, sin afirmar hechos que el archivo no demuestra.",
  },
  sourceLinks: [
    {
      label: "Bellingcat · imágenes de Siria reutilizadas con otro contexto",
      url: "https://www.bellingcat.com/news/2023/12/08/images-of-syrian-civil-war-take-on-a-second-life-in-gaza-conflict/",
    },
  ],
  osintTools: [
    {
      name: "Google Lens",
      url: "https://lens.google/",
    },
    {
      name: "TinEye",
      url: "https://tineye.com/",
    },
    {
      name: "Internet Archive",
      url: "https://web.archive.org/",
    },
  ],
  hotspots: [
    {
      id: "h1",
      label: "El mensaje viral",
      x: 23,
      y: 37,
      evidenceId: "e1",
      detail:
        "El mensaje dice «hoy en Bahía Sur». La verificación editorial se publica dos días después. El pie de foto es una afirmación que hay que contrastar.",
    },
    {
      id: "h2",
      label: "La fuente anterior",
      x: 51,
      y: 60,
      evidenceId: "e2",
      detail:
        "El archivo ficticio de Puerto Gris conserva la misma escena en 2016: tres ventanas y un depósito de agua permiten comprobar la coincidencia.",
    },
    {
      id: "h3",
      label: "Una reedición sin contexto",
      x: 77,
      y: 34,
      evidenceId: "e3",
      detail:
        "Una versión recortada circula en 2020, después del archivo original y antes del mensaje viral. El recorte conserva las tres ventanas.",
    },
  ],
};

export default investigation;
