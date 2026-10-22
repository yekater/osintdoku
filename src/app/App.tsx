import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Fingerprint,
  FolderOpen,
  Clock3,
  Search,
  ShieldCheck,
  BookOpen,
  MapPin,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { cases, getCase } from "../cases/registry";
import type { Investigation } from "../cases/schema";
import InvestigationPage from "../components/Investigation";
import { loadAllProgress } from "../game/persistence";
import s from "../components/Site/Site.module.css";
const COURSE =
  "https://perinfor.odoo.com/slides/acreditacion-tecnico-especialista-en-analisis-forense-en-la-web-10";
function Metadata({
  title,
  description,
  image = "/assets/hero.webp",
}: {
  title: string;
  description: string;
  image?: string;
}) {
  const location = useLocation();
  useEffect(() => {
    document.title = title;
    const set = (key: string, value: string, property = false) => {
      let node = document.head.querySelector<HTMLMetaElement>(
        `meta[${property ? "property" : "name"}="${key}"]`,
      );
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(property ? "property" : "name", key);
        document.head.appendChild(node);
      }
      node.content = value;
    };
    set("description", description);
    set("og:title", title, true);
    set("og:description", description, true);
    set("og:image", new URL(image, window.location.origin).href, true);
    set("og:url", window.location.href, true);
    set("og:type", "website", true);
  }, [title, description, image, location.pathname]);
  return null;
}
function Header() {
  return (
    <header className={s.header}>
      <Link className={s.brand} to="/" aria-label="OSINTDOKU · Inicio">
        <Crosshair aria-hidden="true" />
        <span>
          OSINT<span className={s.brandAccent}>DOKU</span>
          <small>CADA PISTA CUENTA.</small>
        </span>
      </Link>
      <nav aria-label="Navegación principal">
        <NavLink to="/casos">Expedientes</NavLink>
        <NavLink to="/laboratorio">Laboratorio</NavLink>
        <NavLink to="/mis-expedientes">Mis expedientes</NavLink>
      </nav>
      <span className={s.online}>
        <i /> ARCHIVO ABIERTO
      </span>
    </header>
  );
}
function Footer() {
  return (
    <footer className={s.footer}>
      <Link className={s.footerBrand} to="/">
        <Crosshair size={21} />
        OSINTDOKU
      </Link>
      <p>Cada pista cuenta. También cómo la verificas.</p>
      <div>
        <Link to="/laboratorio">Fuentes y metodología</Link>
        <a href={COURSE} target="_blank" rel="noreferrer">
          Formación Perinfor <ArrowUpRight size={15} />
        </a>
      </div>
      <small>
        Experiencia educativa · Sin registro · Progreso en este navegador ·
        Creado por Ekaterina
      </small>
    </footer>
  );
}
function CaseCard({ investigation: c }: { investigation: Investigation }) {
  return (
    <article className={s.card}>
      <Link
        to={`/casos/${c.slug}`}
        className={s.cardImage}
        aria-label={`Abrir caso: ${c.title}`}
      >
        <img
          src={c.heroImage}
          alt={`Portada recreada: ${c.title}`}
          loading="lazy"
        />
        <span className={s.caseNumber}>EXP. {c.id}</span>
        <span className={s.imageTag}>
          {c.sourceType === "simulation"
            ? "SIMULACIÓN"
            : "ADAPTACIÓN EDUCATIVA"}
        </span>
        <ArrowUpRight className={s.imageArrow} aria-hidden="true" />
      </Link>
      <div className={s.cardBody}>
        <div className={s.category}>{c.category}</div>
        <h3>
          <Link to={`/casos/${c.slug}`}>{c.title}</Link>
        </h3>
        <p>{c.summary}</p>
        <div className={s.cardBottom}>
          <span>
            <i className={s.difficulty} />
            {c.difficulty}
          </span>
          <span>
            <Clock3 size={14} />
            {c.estimatedMinutes} min
          </span>
          <Link to={`/casos/${c.slug}`}>
            Abrir caso <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function Catalog({ home = false }: { home?: boolean }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const filtered = cases.filter(
    (c) =>
      (filter === "Todos" || c.category === filter) &&
      `${c.title} ${c.category}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section id="archivo" className={s.catalog}>
      <div className={s.sectionHeading}>
        <div>
          <span className={s.eyebrow}>ELIGE TU PRÓXIMA INVESTIGACIÓN</span>
          <h2>
            Archivo de investigaciones<span>.</span>
          </h2>
        </div>
        {home ? (
          <Link to="/casos" className={s.textLink}>
            Ver el archivo <ArrowUpRight size={18} />
          </Link>
        ) : (
          <span className={s.fileCount}>
            {cases.length.toString().padStart(2, "0")} EXPEDIENTES DISPONIBLES
          </span>
        )}
      </div>
      <div className={s.filters}>
        <div role="group" aria-label="Filtrar por categoría">
          {["Todos", ...new Set(cases.map((c) => c.category))].map(
            (category) => (
              <button
                key={category}
                type="button"
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ),
          )}
        </div>
        {!home && (
          <label className={s.search}>
            <Search size={18} />
            <input
              aria-label="Buscar expedientes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar un expediente"
            />
          </label>
        )}
      </div>
      <div className={s.cards}>
        {filtered.map((c) => (
          <CaseCard key={c.id} investigation={c} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className={s.empty}>
          No hay expedientes con esos criterios. Prueba otra búsqueda.
        </p>
      )}
      <p className={s.disclaimer}>
        <ShieldCheck size={16} /> Todos los retos utilizan evidencias recreadas.
        Las fuentes originales están enlazadas dentro de cada expediente.
      </p>
    </section>
  );
}
function Home() {
  return (
    <>
      <Metadata
        title="OSINTDOKU · Cada pista cuenta"
        description="La verdad deja rastros. Resuelve cinco investigaciones OSINT: analiza pruebas digitales, conecta pistas y descubre qué ocurrió. Sin registro."
      />
      <section className={s.hero}>
        <div className={s.heroBackdrop}>
          <img
            src="/assets/hero.webp"
            alt="Escena cinematográfica recreada: una mesa de investigación con fotografías, mapas y documentos bajo luz nocturna"
            fetchPriority="high"
          />
          <div />
        </div>
        <div className={s.heroInner}>
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={s.heroCopy}
          >
            <span className={s.eyebrow}>
              <i className={s.statusDot} /> INTELIGENCIA DE FUENTES ABIERTAS
            </span>
            <h1>
              LA VERDAD
              <br />
              DEJA <span>RASTROS.</span>
            </h1>
            <p>
              Investiga casos inspirados en hechos reales.
              <br className={s.desktopBreak} /> Analiza pruebas digitales.
              Descubre qué ocurrió.
            </p>
            <div className={s.heroActions}>
              <Link className={s.primaryButton} to={`/casos/${cases[0].slug}`}>
                Empezar una investigación <ArrowRight size={19} />
              </Link>
              <a href="#archivo" className={s.secondaryButton}>
                Explorar expedientes <ArrowDown size={18} />
              </a>
            </div>
            <div className={s.heroMicro}>
              <span>5 investigaciones</span>
              <i />
              <span>Sin registro</span>
              <i />
              <span>Desde tu navegador</span>
            </div>
          </motion.div>
          <div className={s.heroStamp}>
            <Fingerprint size={30} />
            <div>
              <span>OBSERVA. CONECTA. DEDUCE.</span>
              <small>La respuesta está en las pruebas.</small>
            </div>
            <div className={s.heroCredit}>EKATERINA</div>
          </div>
          <div className={s.sceneCaption}>
            ESCENA DRAMATIZADA · IMAGEN GENERADA
          </div>
        </div>
      </section>
      <div className={s.methodStrip}>
        <span>
          <Search size={20} />
          <b>Observa</b>
          <small>El detalle cambia la historia.</small>
        </span>
        <ArrowRight size={18} />
        <span>
          <Fingerprint size={20} />
          <b>Relaciona</b>
          <small>Conecta pruebas, no suposiciones.</small>
        </span>
        <ArrowRight size={18} />
        <span>
          <Crosshair size={20} />
          <b>Resuelve</b>
          <small>Una conclusión. Evidencias sólidas.</small>
        </span>
      </div>
      <Catalog home />
      <section className={s.manifesto}>
        <span className={s.eyebrow}>NO HACE FALTA SER DETECTIVE</span>
        <h2>
          Hace falta
          <br />
          <em>mirar dos veces.</em>
        </h2>
        <div>
          <p>
            Una fecha que no encaja. Una cubierta peculiar. Una imagen que ya
            habías visto. Aprende a investigar mientras sigues el rastro.
          </p>
          <Link className={s.textLink} to="/laboratorio">
            Entra en el laboratorio <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
function CasesPage() {
  return (
    <>
      <Metadata
        title="Archivo de investigaciones OSINT · OSINTDOKU"
        description="Cinco casos interactivos de verificación, geolocalización y análisis de fuentes. Elige tu expediente y comienza la investigación."
      />
      <div className={s.pageIntro}>
        <span className={s.eyebrow}>CADA CASO, UNA FORMA DE MIRAR</span>
        <h1>Las pruebas te esperan.</h1>
        <p>Elige un expediente. Sigue las pistas. Construye tu conclusión.</p>
      </div>
      <Catalog />
    </>
  );
}
function CaseRoute() {
  const { slug } = useParams();
  const c = getCase(slug ?? "");
  if (!c) return <NotFound />;
  return (
    <>
      <Metadata
        title={`${c.title} · OSINTDOKU`}
        description={c.summary}
        image={c.heroImage}
      />
      <InvestigationPage key={c.id} investigation={c} />
    </>
  );
}
function Laboratory() {
  const tools = [
    ...new Map(
      cases.flatMap((c) => c.osintTools).map((t) => [t.url, t]),
    ).values(),
  ];
  return (
    <>
      <Metadata
        title="Laboratorio de investigación OSINT · OSINTDOKU"
        description="Fuentes, herramientas y métodos para contrastar imágenes, localizar escenarios y reconstruir cronologías con rigor."
      />
      <section className={s.editorialPage}>
        <span className={s.eyebrow}>MÉTODO ANTES QUE INTUICIÓN</span>
        <h1>
          El laboratorio<span>.</span>
        </h1>
        <p className={s.lead}>
          Una pista no es una prueba hasta que puedes explicar de dónde viene.
        </p>
        <div className={s.principles}>
          {[
            {
              icon: Search,
              title: "Contrasta el origen",
              text: "Busca la publicación más antigua disponible. La primera que encuentras no tiene por qué ser la original.",
            },
            {
              icon: MapPin,
              title: "Busca coincidencias",
              text: "Una fachada parecida no basta. Compara varios elementos independientes y documenta los descartes.",
            },
            {
              icon: ShieldCheck,
              title: "Reconoce los límites",
              text: "Distingue lo observado de lo inferido. La ausencia de un registro no demuestra que algo nunca existió.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={26} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <h2 className={s.subheading}>Fuentes de las investigaciones</h2>
        <p className={s.muted}>
          Los casos son ejercicios ficticios inspirados en metodologías reales.
          Sus fechas, documentos y ubicaciones no son pruebas de los hechos
          originales.
        </p>
        <div className={s.sourceList}>
          {cases.map((c) => (
            <article key={c.id}>
              <span>EXP. {c.id}</span>
              <h3>{c.title}</h3>
              <p>
                {c.sourceType === "simulation"
                  ? "Simulación sobre verificación corporativa."
                  : "Adaptación educativa; consulta el artículo para conocer los hechos documentados."}
              </p>
              {c.sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label} <ArrowUpRight size={16} />
                </a>
              ))}
            </article>
          ))}
        </div>
        <h2 className={s.subheading}>Tu caja de herramientas</h2>
        <div className={s.tools}>
          {tools.map((t) => (
            <a key={t.url} href={t.url} target="_blank" rel="noreferrer">
              <BookOpen size={20} />
              <span>{t.name}</span>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
        <aside className={s.ethics}>
          <ShieldCheck />
          <div>
            <h3>Investiga con responsabilidad</h3>
            <p>
              Trabaja con información pública y respeta la privacidad. Estas
              simulaciones no requieren buscar datos personales ni contactar con
              personas reales.
            </p>
          </div>
        </aside>
        <Training />
      </section>
    </>
  );
}
export function Training() {
  return (
    <aside className={s.training}>
      <div>
        <span className={s.eyebrow}>SIGUE EL RASTRO</span>
        <h2>
          ¿Quieres investigar casos
          <br />
          reales en España?
        </h2>
        <p>
          Aprende a buscar información pública, verificar imágenes y documentar
          tus investigaciones mediante técnicas OSINT.
        </p>
      </div>
      <a
        className={s.primaryButton}
        href={COURSE}
        target="_blank"
        rel="noreferrer"
      >
        Descubrir la formación OSINT <ArrowUpRight size={18} />
      </a>
      <small>
        Consulta el programa y las condiciones de certificación en Perinfor.
      </small>
    </aside>
  );
}
function ProgressPage() {
  const [progress] = useState(() => loadAllProgress());
  const started = cases.filter((c) => progress[c.id]);
  const won = started.filter(
    (c) => progress[c.id]?.solved && !progress[c.id]?.revealed,
  ).length;
  return (
    <>
      <Metadata
        title="Mis expedientes · OSINTDOKU"
        description="Retoma tus investigaciones OSINT y consulta tu progreso guardado localmente en este navegador."
      />
      <section className={s.editorialPage}>
        <span className={s.eyebrow}>TU ARCHIVO PERSONAL</span>
        <h1>
          Mis expedientes<span>.</span>
        </h1>
        <p className={s.lead}>Cada conexión que haces deja huella.</p>
        <div className={s.progressSummary}>
          <div>
            <strong>{won.toString().padStart(2, "0")}</strong>
            <span>Casos resueltos</span>
          </div>
          <div>
            <strong>{started.length.toString().padStart(2, "0")}</strong>
            <span>Investigaciones iniciadas</span>
          </div>
          <div>
            <strong>05</strong>
            <span>Historias por descubrir</span>
          </div>
        </div>
        {started.length === 0 ? (
          <div className={s.emptyArchive}>
            <FolderOpen size={40} />
            <h2>Tu primera pista te espera.</h2>
            <p>
              Abre un caso y tu progreso se guardará aquí, en este navegador.
            </p>
            <Link className={s.primaryButton} to="/casos">
              Explorar expedientes <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className={s.progressList}>
            {started.map((c) => {
              const p = progress[c.id];
              return (
                <article key={c.id}>
                  <img src={c.heroImage} alt="" />
                  <div>
                    <span className={s.eyebrow}>EXPEDIENTE {c.id}</span>
                    <h2>{c.title}</h2>
                    <p>
                      {p.revealed
                        ? "Solución consultada · sin victoria"
                        : p.solved
                          ? "Caso resuelto"
                          : `${p.examined.length} pruebas examinadas · ${p.hintsUsed} pistas utilizadas`}
                    </p>
                  </div>
                  <Link className={s.secondaryButton} to={`/casos/${c.slug}`}>
                    {p.solved ? <Check size={18} /> : <RotateCcw size={18} />}{" "}
                    {p.solved || p.revealed
                      ? "Revisar expediente"
                      : "Continuar"}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
        <p className={s.storageNote}>
          <ShieldCheck size={17} /> El progreso se guarda solo en este
          navegador. Si borras sus datos o usas otro dispositivo, no estará
          disponible. No se requiere una cuenta.
        </p>
      </section>
    </>
  );
}
function NotFound() {
  return (
    <section className={s.notFound}>
      <span className={s.eyebrow}>EXPEDIENTE NO LOCALIZADO · 404</span>
      <h1>Este rastro termina aquí.</h1>
      <p>La dirección no corresponde a una investigación del archivo.</p>
      <Link className={s.primaryButton} to="/casos">
        Volver a los expedientes <ArrowRight size={18} />
      </Link>
    </section>
  );
}
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export function AppRoutes() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <ScrollReset />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/casos" element={<CasesPage />} />
          <Route path="/casos/:slug" element={<CaseRoute />} />
          <Route path="/laboratorio" element={<Laboratory />} />
          <Route path="/mis-expedientes" element={<ProgressPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
