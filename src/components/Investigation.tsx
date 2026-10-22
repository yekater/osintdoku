import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  FileSearch,
  Lightbulb,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Undo2,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Evidence, Investigation } from "../cases/schema";
import {
  assignmentToGrid,
  checkGrid,
  createGrid,
  setCell,
  type CellState,
  type Grid,
} from "../game/engine";
import {
  loadProgress,
  saveProgress,
  type CaseProgress,
  type Phase,
} from "../game/persistence";
import styles from "./Investigation.module.css";

const stages: { id: Phase; label: string }[] = [
  { id: "cover", label: "Expediente" },
  { id: "briefing", label: "Misión" },
  { id: "scene", label: "Escena" },
  { id: "evidence", label: "Evidencias" },
  { id: "board", label: "Deducción" },
  { id: "verdict", label: "Veredicto" },
  { id: "resolution", label: "Resolución" },
];
const labels: Record<CellState, string> = {
  unknown: "Sin decidir",
  possible: "Posible",
  excluded: "Descartada",
  confirmed: "Confirmada",
};
const symbols: Record<CellState, string> = {
  unknown: "·",
  possible: "?",
  excluded: "×",
  confirmed: "✓",
};

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = ref.current;
    element
      ?.querySelector<HTMLElement>('button, a, input, [tabindex="0"]')
      ?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const focusables = Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, select, [tabindex="0"]',
        ) ?? [],
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className={styles.backdrop}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.dialogHeader}>
          <span className={styles.eyebrow}>ARCHIVO DE EVIDENCIAS</span>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <X size={22} />
          </button>
        </div>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function EvidenceViewer({
  evidence,
  onClose,
}: {
  evidence: Evidence;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <Dialog title={evidence.title} onClose={onClose}>
      <div className={styles.viewerTools}>
        <span>
          {evidence.type} {evidence.date && `· ${evidence.date}`}
        </span>
        <div>
          <button
            className={styles.iconButton}
            onClick={() => setZoom((v) => Math.max(1, v - 0.5))}
            aria-label="Reducir evidencia"
            disabled={zoom === 1}
          >
            <Minus size={20} />
          </button>
          <span aria-live="polite">{Math.round(zoom * 100)} %</span>
          <button
            className={styles.iconButton}
            onClick={() => setZoom((v) => Math.min(3, v + 0.5))}
            aria-label="Ampliar evidencia"
            disabled={zoom === 3}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <div
        className={styles.evidenceImageViewport}
        tabIndex={0}
        aria-label="Imagen de evidencia ampliable; desplázate para examinarla"
      >
        <img
          data-testid="evidence-image"
          src={evidence.image}
          alt={evidence.observation}
          style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
        />
      </div>
      <div className={styles.documentInfo}>
        <span className={styles.recreated}>
          EVIDENCIA {evidence.status.toUpperCase()}
        </span>
        <p className={styles.observation}>{evidence.observation}</p>
        <dl>
          <div>
            <dt>Procedencia</dt>
            <dd>{evidence.provenance}</dd>
          </div>
          <div>
            <dt>Técnica o herramienta</dt>
            <dd>{evidence.tool}</dd>
          </div>
        </dl>
      </div>
    </Dialog>
  );
}

export default function InvestigationPage({
  investigation,
}: {
  investigation: Investigation;
}) {
  return (
    <InvestigationSession
      key={investigation.id}
      investigation={investigation}
    />
  );
}

function InvestigationSession({
  investigation: c,
}: {
  investigation: Investigation;
}) {
  const [progress, setProgress] = useState<CaseProgress>(() =>
    loadProgress(c.id, c.entities.length),
  );
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [confirmation, setConfirmation] = useState<"reset" | "reveal" | null>(
    null,
  );
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<[number, number]>([0, 0]);
  const [matrix, setMatrix] = useState(c.mechanic === "claims");
  const [zoom, setZoom] = useState(1);
  const [comparison, setComparison] = useState(50);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState(0);
  const [sequence, setSequence] = useState<number[]>(() => {
    const saved = loadProgress(c.id, c.entities.length).grid;
    const positions = saved.map((row) => row.indexOf("confirmed"));
    return positions.every((i) => i >= 0)
      ? positions
          .map((_, index) => index)
          .sort((a, b) => positions[a] - positions[b])
      : c.entities.map((_, i) => i);
  });
  const [saved, setSaved] = useState(true);
  const drag = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const heading = useRef<HTMLHeadingElement>(null);
  const stageIndex = stages.findIndex((stage) => stage.id === progress.phase);
  useEffect(() => {
    const assignment = progress.grid.map((row) => row.indexOf("confirmed"));
    const unique =
      assignment.every((index) => index >= 0) &&
      new Set(assignment).size === c.entities.length &&
      progress.grid.every(
        (row) => row.filter((cell) => cell === "confirmed").length === 1,
      );
    setSequence(
      unique
        ? assignment
            .map((_, entity) => entity)
            .sort((a, b) => assignment[a] - assignment[b])
        : c.entities.map((_, i) => i),
    );
  }, [progress.grid, c.entities]);
  const boardCheck = checkGrid(progress.grid, c.solution);
  const allRead = c.visualEvidence.every((item) =>
    progress.examined.includes(item.id),
  );
  useEffect(() => {
    setSaved(saveProgress(c.id, progress));
    window.dispatchEvent(new Event("osintdoku:progress"));
  }, [progress, c.id]);
  useEffect(() => {
    setFeedback("");
    if (progress.phase !== "cover") heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [progress.phase]);
  const update = (change: Partial<CaseProgress>) =>
    setProgress((old) => ({ ...old, ...change }));
  const navigate = (phase: Phase) => update({ phase });
  function openEvidence(item: Evidence) {
    setProgress((old) => ({
      ...old,
      examined: [...new Set([...old.examined, item.id])],
    }));
    setEvidence(item);
  }
  function editGrid(next: Grid) {
    setProgress((old) => ({
      ...old,
      grid: next,
      history: [...old.history.slice(-39), old.grid],
    }));
    setFeedback("");
  }
  function applyState(state: CellState) {
    editGrid(setCell(progress.grid, selected[0], selected[1], state));
    if (state === "confirmed")
      setFeedback(
        "Relación confirmada. Puedes descartar sus alternativas de forma explícita; cada elemento tiene una única correspondencia.",
      );
  }
  function discover(id: string) {
    const hotspot = c.hotspots.find((item) => item.id === id);
    if (!hotspot) return;
    setActiveHotspot(id);
    setProgress((old) => ({
      ...old,
      discovered: [...new Set([...old.discovered, id])],
    }));
  }
  function moveItem(index: number, direction: -1 | 1) {
    const next = [...sequence];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSequence(next);
    const assignment = next.map((_, entity) => next.indexOf(entity));
    editGrid(assignmentToGrid(assignment));
  }
  function selectMatch(row: number, value: string) {
    if (value === "") {
      editGrid(
        progress.grid.map((cells, i) =>
          i === row ? cells.map(() => "unknown" as CellState) : [...cells],
        ),
      );
      return;
    }
    const next = progress.grid.map((cells, i) =>
      i === row ? cells.map(() => "unknown" as CellState) : [...cells],
    );
    editGrid(setCell(next, row, Number(value), "confirmed"));
  }
  function reveal() {
    setProgress((old) =>
      old.solved && !old.revealed
        ? { ...old, phase: "resolution" }
        : { ...old, revealed: true, solved: false, phase: "resolution" },
    );
    setConfirmation(null);
  }
  function confirmVerdict() {
    if (!checkGrid(progress.grid, c.solution).solved || !allRead) {
      setFeedback(
        "Revisa todas las evidencias y completa las relaciones antes de confirmar el veredicto.",
      );
      return;
    }
    if (progress.verdictId !== c.verdict.correctId) {
      const chosen = c.verdict.options.find(
        (option) => option.id === progress.verdictId,
      );
      setFeedback(
        chosen
          ? chosen.explanation
          : "Selecciona una conclusión respaldada por las pruebas.",
      );
      return;
    }
    setProgress((old) => ({
      ...old,
      solved: !old.revealed,
      phase: "resolution",
    }));
  }
  const currentHotspot = c.hotspots.find((item) => item.id === activeHotspot);
  const sourceLabel =
    c.sourceType === "simulation"
      ? "Simulación educativa"
      : "Adaptación educativa · pruebas recreadas";
  return (
    <article
      className={styles.investigation}
      data-testid={`phase-${progress.phase}`}
    >
      <div className={styles.topline}>
        <Link to="/casos" className={styles.backLink}>
          <ArrowLeft size={17} /> Archivo de investigaciones
        </Link>
        {saved && (
          <span className={styles.saveStatus}>
            Progreso guardado en este navegador
          </span>
        )}
      </div>
      {!saved && (
        <p className={styles.storageWarning} role="status">
          El navegador no permite guardar el progreso. Puedes seguir jugando,
          pero mantén esta pestaña abierta para conservar tus avances.
        </p>
      )}
      {progress.phase !== "cover" && (
        <div className={styles.progressArea}>
          <div className={styles.caseIdentity}>
            <span className={styles.eyebrow}>EXPEDIENTE {c.id}</span>
            <span>{c.title}</span>
          </div>
          <ol className={styles.stepper} aria-label="Fases de la investigación">
            {stages.map((stage, i) => (
              <li
                key={stage.id}
                className={
                  i === stageIndex
                    ? styles.currentStep
                    : i < stageIndex
                      ? styles.doneStep
                      : ""
                }
              >
                <span>
                  {i < stageIndex ? (
                    <Check size={14} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span>{stage.label}</span>
              </li>
            ))}
          </ol>
          <div className={styles.progressTrack}>
            <span
              style={{ width: `${(stageIndex / (stages.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
      <motion.div
        key={progress.phase}
        initial={mounted && !reducedMotion ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {progress.phase === "cover" && (
          <section className={styles.caseCover}>
            <img
              src={c.heroImage}
              alt={`Escena cinematográfica recreada para ${c.title}`}
              className={styles.coverImage}
            />
            <div className={styles.coverShade} />
            <div className={styles.coverContent}>
              <span className={styles.eyebrow}>
                EXPEDIENTE {c.id} / {c.category.toUpperCase()}
              </span>
              <h1>{c.title}</h1>
              <p className={styles.subtitle}>{c.subtitle}</p>
              <div className={styles.coverMeta}>
                <span>
                  <Clock3 size={17} />
                  {c.estimatedMinutes} min
                </span>
                <span>
                  <ScanLine size={17} />
                  {c.difficulty}
                </span>
                <span>Sin registro</span>
              </div>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("briefing")}
              >
                Comenzar investigación <ArrowRight size={19} />
              </button>
              <span className={styles.coverDisclaimer}>
                {sourceLabel}. Las escenas son ilustrativas.
              </span>
            </div>
          </section>
        )}
        {progress.phase === "briefing" && (
          <section className={styles.briefing}>
            <div>
              <span className={styles.eyebrow}>01 / TU MISIÓN</span>
              <h1 ref={heading} tabIndex={-1}>
                La historia tiene
                <br />
                una grieta.
              </h1>
              <div className={styles.briefBlock}>
                <h2>¿Qué ocurrió?</h2>
                <p>{c.briefing}</p>
              </div>
              <div className={styles.mission}>
                <span>OBJETIVO DE LA INVESTIGACIÓN</span>
                <p>{c.objective}</p>
              </div>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("scene")}
              >
                Examinar la escena <ArrowRight size={19} />
              </button>
            </div>
            <aside className={styles.briefEvidence}>
              <span className={styles.eyebrow}>PRIMERAS PRUEBAS</span>
              {c.visualEvidence.slice(0, 3).map((item, index) => (
                <div key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <span>
                      0{index + 1} / {item.type}
                    </span>
                    <h3>{item.title}</h3>
                  </div>
                </div>
              ))}
              <p className={styles.disclaimer}>
                {sourceLabel}. Los detalles y documentos del juego son
                ficticios; las fuentes originales se consultan al final.
              </p>
            </aside>
          </section>
        )}
        {progress.phase === "scene" && (
          <section>
            <div className={styles.stageHeading}>
              <div>
                <span className={styles.eyebrow}>
                  02 / OBSERVAR ANTES DE CONCLUIR
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  Examina la escena.
                </h1>
                <p>
                  Amplía la imagen y selecciona los puntos de interés. Cada
                  detalle puede cambiar tu hipótesis.
                </p>
              </div>
              <span className={styles.counter}>
                {progress.discovered.length} / {c.hotspots.length} detalles
              </span>
            </div>
            <div className={styles.sceneLayout}>
              <div>
                <div
                  className={styles.sceneViewport}
                  onPointerDown={(event) => {
                    if ((event.target as HTMLElement).closest("button")) return;
                    drag.current = {
                      x: event.clientX,
                      y: event.clientY,
                      startX: pan.x,
                      startY: pan.y,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (drag.current && zoom > 1) {
                      const bounds =
                        event.currentTarget.getBoundingClientRect();
                      const maxX = (bounds.width * (zoom - 1)) / 2;
                      const maxY = (bounds.height * (zoom - 1)) / 2;
                      setPan({
                        x: Math.max(
                          -maxX,
                          Math.min(
                            maxX,
                            drag.current.startX +
                              event.clientX -
                              drag.current.x,
                          ),
                        ),
                        y: Math.max(
                          -maxY,
                          Math.min(
                            maxY,
                            drag.current.startY +
                              event.clientY -
                              drag.current.y,
                          ),
                        ),
                      });
                    }
                  }}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                >
                  <div
                    className={styles.sceneCanvas}
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    }}
                  >
                    <img
                      data-testid="scene-image"
                      src={c.sceneImage}
                      alt={c.visualEvidence
                        .map((item) => item.observation)
                        .join(" ")}
                    />
                    {c.hotspots.map((spot, index) => (
                      <button
                        key={spot.id}
                        className={`${styles.hotspot} ${progress.discovered.includes(spot.id) ? styles.discovered : ""}`}
                        style={{
                          left: `${spot.x}%`,
                          top: `${spot.y}%`,
                          transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                        }}
                        aria-label={`Inspeccionar: ${spot.label}`}
                        onClick={() => discover(spot.id)}
                      >
                        {progress.discovered.includes(spot.id) ? (
                          <Check size={17} />
                        ) : (
                          index + 1
                        )}
                      </button>
                    ))}
                  </div>
                  <span className={styles.sceneStamp}>
                    RECONSTRUCCIÓN EDUCATIVA · NO ES UNA PRUEBA ORIGINAL
                  </span>
                </div>
                <div className={styles.sceneControls}>
                  <span>Arrastra para desplazarte al ampliar</span>
                  <div>
                    <button
                      className={styles.iconButton}
                      aria-label="Reducir escena"
                      disabled={zoom === 1}
                      onClick={() => {
                        setZoom((v) => Math.max(1, v - 0.5));
                        setPan({ x: 0, y: 0 });
                      }}
                    >
                      <Minus size={20} />
                    </button>
                    <span>{Math.round(zoom * 100)} %</span>
                    <button
                      className={styles.iconButton}
                      aria-label="Ampliar escena"
                      disabled={zoom === 2.5}
                      onClick={() => setZoom((v) => Math.min(2.5, v + 0.5))}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      className={styles.iconButton}
                      aria-label="Restablecer vista"
                      onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                      }}
                    >
                      <Maximize2 size={19} />
                    </button>
                  </div>
                </div>
              </div>
              <aside className={styles.cluePanel}>
                <span className={styles.eyebrow}>PUNTOS DE INTERÉS</span>
                {c.hotspots.map((spot, i) => (
                  <button
                    className={
                      activeHotspot === spot.id ? styles.activeClue : ""
                    }
                    key={spot.id}
                    onClick={() => discover(spot.id)}
                  >
                    <span>
                      {progress.discovered.includes(spot.id) ? (
                        <Check size={17} />
                      ) : (
                        `0${i + 1}`
                      )}
                    </span>
                    {spot.label}
                    <ArrowRight size={16} />
                  </button>
                ))}
                <div className={styles.activeObservation} aria-live="polite">
                  {currentHotspot ? (
                    <>
                      <span>OBSERVACIÓN REGISTRADA</span>
                      <p>{currentHotspot.detail}</p>
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          const item = c.visualEvidence.find(
                            (item) => item.id === currentHotspot.evidenceId,
                          );
                          if (item) openEvidence(item);
                        }}
                      >
                        Consultar evidencia <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Search size={28} />
                      <p>
                        Selecciona un detalle de la escena para empezar a
                        registrar observaciones.
                      </p>
                    </>
                  )}
                </div>
              </aside>
            </div>
            {c.id === "002" && (
              <section
                className={styles.comparisonSection}
                aria-labelledby="comparison-heading"
              >
                <div>
                  <span className={styles.eyebrow}>
                    DOS MOMENTOS / UNA MISMA PARCELA
                  </span>
                  <h2 id="comparison-heading">
                    El terreno también deja huellas.
                  </h2>
                  <p>
                    Desplaza el comparador: en febrero predominaba la
                    vegetación; en junio aparecen un acceso occidental y
                    materiales apilados.
                  </p>
                </div>
                <div className={styles.comparisonViewport}>
                  <img
                    src="/assets/cases/002/after.webp"
                    alt="Después, junio: reconstrucción de la parcela con acceso por el oeste y materiales apilados."
                  />
                  <div
                    className={styles.comparisonBefore}
                    style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
                  >
                    <img
                      src="/assets/cases/002/before.webp"
                      alt="Antes, febrero: reconstrucción de la misma parcela con vegetación y sin acceso ni materiales visibles."
                    />
                  </div>
                  <span className={styles.comparisonBeforeLabel}>
                    ANTES · FEBRERO
                  </span>
                  <span className={styles.comparisonAfterLabel}>
                    DESPUÉS · JUNIO
                  </span>
                  <div
                    className={styles.comparisonDivider}
                    style={{ left: `${comparison}%` }}
                  >
                    <span>↔</span>
                  </div>
                </div>
                <label className={styles.comparisonRange}>
                  <span>Comparar imágenes de la parcela</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparison}
                    aria-label="Comparar imágenes de la parcela"
                    aria-valuetext={`${comparison} % de la imagen de febrero visible`}
                    onChange={(event) =>
                      setComparison(Number(event.target.value))
                    }
                  />
                  <span>{comparison} % antes</span>
                </label>
                <p className={styles.disclaimer}>
                  Imágenes generadas para esta simulación. Permiten observar
                  cambios; no identifican a su autor ni acreditan
                  responsabilidad jurídica.
                </p>
              </section>
            )}
            <div className={styles.stageFooter}>
              <span>
                Los marcadores también se pueden seleccionar con el teclado.
              </span>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("evidence")}
              >
                Ver evidencias <ArrowRight size={19} />
              </button>
            </div>
          </section>
        )}
        {progress.phase === "evidence" && (
          <section>
            <div className={styles.stageHeading}>
              <div>
                <span className={styles.eyebrow}>
                  03 / CONTRASTAR LAS FUENTES
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  Las pruebas, de cerca.
                </h1>
                <p>
                  Abre cada documento. Busca qué demuestra y qué deja sin
                  responder.
                </p>
              </div>
              <span className={styles.counter}>
                {progress.examined.length} / {c.visualEvidence.length}{" "}
                examinadas
              </span>
            </div>
            <div className={styles.evidenceGrid}>
              {c.visualEvidence.map((item, index) => (
                <button
                  data-testid={`evidence-${item.id}`}
                  className={styles.evidenceCard}
                  key={item.id}
                  onClick={() => openEvidence(item)}
                >
                  <div className={styles.evidenceThumb}>
                    <img src={item.image} alt={item.title} />
                    <span className={styles.evidenceNumber}>
                      E-{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.openEvidence}>
                      <Maximize2 size={21} /> Examinar
                    </span>
                  </div>
                  <div className={styles.evidenceCardBody}>
                    <div>
                      <span className={styles.eyebrow}>{item.type}</span>
                      {progress.examined.includes(item.id) && (
                        <span className={styles.readBadge}>
                          <Check size={15} /> Examinada
                        </span>
                      )}
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.observation}</p>
                    <span className={styles.recreated}>
                      EVIDENCIA {item.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.stageFooter}>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("scene")}
              >
                <ArrowLeft size={18} /> Volver a la escena
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("board")}
              >
                Abrir tablero <ArrowRight size={19} />
              </button>
            </div>
          </section>
        )}
        {progress.phase === "board" && (
          <section>
            <div className={styles.stageHeading}>
              <div>
                <span className={styles.eyebrow}>
                  04 / CONECTAR LO QUE SABES
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  {c.mechanic === "timeline"
                    ? "Reconstruye la cronología."
                    : c.mechanic === "geolocation"
                      ? "Encuentra la coincidencia."
                      : c.mechanic === "provenance"
                        ? "Sigue el rastro del archivo."
                        : c.mechanic === "verification"
                          ? "Devuelve cada imagen a su contexto."
                          : "Separa afirmaciones y pruebas."}
                </h1>
                <p>
                  {c.mechanic === "timeline"
                    ? "Ordena las observaciones de la más antigua a la más reciente."
                    : "Cada elemento tiene una única correspondencia. Contrasta las relaciones con tus evidencias."}
                </p>
              </div>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("evidence")}
              >
                <FileSearch size={18} /> Consultar evidencias
              </button>
            </div>
            <div className={styles.boardToolbar}>
              <div>
                <button
                  className={matrix ? styles.activeMode : ""}
                  onClick={() => setMatrix(true)}
                >
                  Matriz deductiva
                </button>
                {c.mechanic !== "claims" && (
                  <button
                    className={!matrix ? styles.activeMode : ""}
                    onClick={() => setMatrix(false)}
                  >
                    {c.mechanic === "timeline"
                      ? "Línea temporal"
                      : c.mechanic === "geolocation"
                        ? "Localizaciones"
                        : c.mechanic === "provenance"
                          ? "Cadena de fuentes"
                          : "Mesa de verificación"}
                  </button>
                )}
              </div>
              <div>
                <button
                  onClick={() => {
                    const previous = progress.history.at(-1);
                    if (previous) {
                      update({
                        grid: previous,
                        history: progress.history.slice(0, -1),
                      });
                      setFeedback("Último cambio deshecho.");
                    }
                  }}
                  disabled={!progress.history.length}
                >
                  <Undo2 size={17} /> Deshacer
                </button>
                <button onClick={() => setConfirmation("reset")}>
                  <RotateCcw size={17} /> Reiniciar tablero
                </button>
              </div>
            </div>
            {matrix ? (
              <div className={styles.matrixShell}>
                <p className={styles.matrixInstruction}>
                  Selecciona una celda y marca su estado. <strong>✓</strong>{" "}
                  confirmada · <strong>×</strong> descartada ·{" "}
                  <strong>?</strong> posible
                </p>
                <p className={styles.mobileBoardInstruction}>
                  Desliza el tablero para ver todas las columnas.
                </p>
                <div
                  className={styles.matrixScroller}
                  tabIndex={0}
                  role="region"
                  aria-label="Tablero deductivo con desplazamiento horizontal"
                >
                  <table className={styles.matrix}>
                    <caption className={styles.visuallyHidden}>
                      Relaciones entre elementos y categorías
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">EVIDENCIA / RELACIÓN</th>
                        {c.categories.map((category) => (
                          <th key={category} scope="col">
                            {category}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {c.entities.map((entity, row) => (
                        <tr key={entity}>
                          <th scope="row">{entity}</th>
                          {c.categories.map((category, col) => (
                            <td key={category}>
                              <button
                                data-testid={`cell-${row}-${col}`}
                                aria-label={`${entity} — ${category}: ${labels[progress.grid[row][col]]}`}
                                aria-pressed={
                                  selected[0] === row && selected[1] === col
                                }
                                className={`${styles.cell} ${styles[progress.grid[row][col]]} ${selected[0] === row && selected[1] === col ? styles.selectedCell : ""}`}
                                onClick={() => setSelected([row, col])}
                              >
                                {symbols[progress.grid[row][col]]}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.cellEditor}>
                  <span>
                    {c.entities[selected[0]]}
                    <ArrowRight size={15} />
                    {c.categories[selected[1]]}
                  </span>
                  <div>
                    {(
                      [
                        "confirmed",
                        "excluded",
                        "possible",
                        "unknown",
                      ] as CellState[]
                    ).map((state) => (
                      <button
                        key={state}
                        className={styles[state]}
                        aria-pressed={
                          progress.grid[selected[0]][selected[1]] === state
                        }
                        onClick={() => applyState(state)}
                      >
                        {symbols[state]}{" "}
                        {state === "confirmed"
                          ? "Confirmar relación"
                          : state === "excluded"
                            ? "Descartar relación"
                            : labels[state]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : c.mechanic === "timeline" ? (
              <div className={styles.timelineBoard}>
                {sequence.map((entity, index) => (
                  <div className={styles.timelineItem} key={entity}>
                    <span className={styles.timelineDate}>
                      {c.categories[index]}
                    </span>
                    <div>
                      <span>
                        OBSERVACIÓN {String(entity + 1).padStart(2, "0")}
                      </span>
                      <h3>{c.entities[entity]}</h3>
                    </div>
                    <div className={styles.orderControls}>
                      <button
                        className={styles.iconButton}
                        aria-label={`Adelantar ${c.entities[entity]}`}
                        disabled={index === 0}
                        onClick={() => moveItem(index, -1)}
                      >
                        <ChevronUp size={21} />
                      </button>
                      <button
                        className={styles.iconButton}
                        aria-label={`Retrasar ${c.entities[entity]}`}
                        disabled={index === sequence.length - 1}
                        onClick={() => moveItem(index, 1)}
                      >
                        <ChevronDown size={21} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className={styles.secondaryButton}
                  onClick={() =>
                    editGrid(
                      assignmentToGrid(
                        sequence.map((_, entity) => sequence.indexOf(entity)),
                      ),
                    )
                  }
                >
                  Confirmar orden actual <Check size={18} />
                </button>
              </div>
            ) : (
              <div
                className={`${styles.matchingBoard} ${c.mechanic === "provenance" ? styles.sourceChain : ""}`}
              >
                {c.entities.map((entity, row) => (
                  <article key={entity} className={styles.matchingCard}>
                    <span className={styles.eyebrow}>
                      {c.mechanic === "geolocation"
                        ? "PERFIL VISUAL"
                        : c.mechanic === "provenance"
                          ? "ESLABÓN DOCUMENTAL"
                          : "PUBLICACIÓN"}{" "}
                      {String(row + 1).padStart(2, "0")}
                    </span>
                    {c.entityEvidenceIds[row] && (
                      <img
                        src={
                          c.visualEvidence.find(
                            (item) => item.id === c.entityEvidenceIds[row],
                          )?.image
                        }
                        alt={
                          c.visualEvidence.find(
                            (item) => item.id === c.entityEvidenceIds[row],
                          )?.title ?? "Prueba relacionada"
                        }
                      />
                    )}
                    <h3>{entity}</h3>
                    <label htmlFor={`match-${row}`}>
                      {c.mechanic === "geolocation"
                        ? "Localización respaldada"
                        : c.mechanic === "provenance"
                          ? "Posición en el archivo"
                          : "Contexto respaldado"}
                    </label>
                    <select
                      id={`match-${row}`}
                      value={
                        progress.grid[row].indexOf("confirmed") < 0
                          ? ""
                          : progress.grid[row].indexOf("confirmed")
                      }
                      onChange={(event) => selectMatch(row, event.target.value)}
                    >
                      <option value="">Seleccionar correspondencia</option>
                      {c.categories.map((category, col) => (
                        <option key={category} value={col}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            )}
            <div className={styles.deductionSupport}>
              <details className={styles.clueDetails} open>
                <summary>
                  <FileSearch size={18} /> Notas de investigación{" "}
                  <span>{c.logicalClues.length}</span>
                </summary>
                <ul>
                  {c.logicalClues.map((clue) => (
                    <li key={clue.id}>
                      <p>{clue.text}</p>
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          const item = c.visualEvidence.find(
                            (item) => item.id === clue.evidenceId,
                          );
                          if (item) openEvidence(item);
                        }}
                      >
                        Ver prueba <ArrowRight size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
              <div className={styles.hintPanel}>
                <div>
                  <Lightbulb size={20} />
                  <h2>Una pista, si la necesitas.</h2>
                  <span>{progress.hintsUsed} / 3</span>
                </div>
                {progress.hintsUsed > 0 && (
                  <>
                    <div className={styles.hintTabs}>
                      {c.hintLevels
                        .slice(0, progress.hintsUsed)
                        .map((hint, index) => (
                          <button
                            key={hint.level}
                            className={
                              activeHint === index ? styles.activeMode : ""
                            }
                            onClick={() => setActiveHint(index)}
                          >
                            Nivel {hint.level}
                          </button>
                        ))}
                    </div>
                    <p aria-live="polite">{c.hintLevels[activeHint]?.text}</p>
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        const item = c.visualEvidence.find(
                          (item) =>
                            item.id === c.hintLevels[activeHint]?.evidenceId,
                        );
                        if (item) openEvidence(item);
                      }}
                    >
                      Examinar evidencia señalada <ArrowRight size={15} />
                    </button>
                  </>
                )}
                <button
                  className={styles.secondaryButton}
                  disabled={progress.hintsUsed >= 3}
                  onClick={() => {
                    setActiveHint(progress.hintsUsed);
                    update({ hintsUsed: Math.min(3, progress.hintsUsed + 1) });
                  }}
                >
                  {progress.hintsUsed >= 3
                    ? "Todas las pistas disponibles"
                    : "Solicitar pista"}{" "}
                  <Lightbulb size={17} />
                </button>
              </div>
            </div>
            <div className={styles.feedback} role="status" aria-live="polite">
              {feedback}
            </div>
            <div className={styles.stageFooter}>
              <button
                className={styles.secondaryButton}
                onClick={() =>
                  setFeedback(checkGrid(progress.grid, c.solution).message)
                }
              >
                <ShieldCheck size={18} /> Comprobar progreso
              </button>
              <div>
                {!allRead && (
                  <span className={styles.gateMessage}>
                    Examina todas las pruebas antes de emitir el veredicto.
                  </span>
                )}
                <button
                  className={styles.primaryButton}
                  disabled={!boardCheck.solved || !allRead}
                  onClick={() => navigate("verdict")}
                >
                  Emitir veredicto <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </section>
        )}
        {progress.phase === "verdict" && (
          <section className={styles.verdictSection}>
            <span className={styles.eyebrow}>05 / LA CONCLUSIÓN ES TUYA</span>
            <h1 ref={heading} tabIndex={-1}>
              {c.verdict.question}
            </h1>
            <p>
              Has contrastado las pruebas. Decide qué conclusión puedes defender
              con ellas.
            </p>
            <fieldset className={styles.verdictOptions}>
              <legend className={styles.visuallyHidden}>
                Selecciona tu veredicto
              </legend>
              {c.verdict.options.map((option, index) => (
                <label
                  key={option.id}
                  className={
                    progress.verdictId === option.id ? styles.chosenVerdict : ""
                  }
                >
                  <input
                    type="radio"
                    name="verdict"
                    value={option.id}
                    checked={progress.verdictId === option.id}
                    onChange={() => {
                      update({ verdictId: option.id });
                      setFeedback("");
                    }}
                  />
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option.text}</strong>
                  <span className={styles.radioIndicator}>
                    {progress.verdictId === option.id && <Check size={17} />}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className={styles.feedback} role="status">
              {feedback}
            </div>
            <div className={styles.stageFooter}>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("board")}
              >
                <ArrowLeft size={17} /> Revisar tablero
              </button>
              <button
                className={styles.primaryButton}
                disabled={!progress.verdictId}
                onClick={confirmVerdict}
              >
                Confirmar veredicto <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {progress.phase === "resolution" && (
          <section className={styles.resolutionSection}>
            <div className={styles.resultHeader}>
              <span className={styles.resultIcon}>
                {progress.solved && !progress.revealed ? (
                  <ShieldCheck size={33} />
                ) : (
                  <Eye size={33} />
                )}
              </span>
              <span className={styles.eyebrow}>
                {progress.revealed
                  ? "SOLUCIÓN CONSULTADA · SIN LOGRO"
                  : "CASO RESUELTO"}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {progress.revealed
                  ? "Cada prueba tiene su lugar."
                  : "Has seguido el rastro."}
              </h1>
              <p>{c.resolution.conclusion}</p>
              {progress.revealed && (
                <p className={styles.disclaimer}>
                  Has revelado la solución. Este expediente no cuenta como
                  resuelto, aunque revises después el tablero.
                </p>
              )}
            </div>
            <div className={styles.resolutionVisual}>
              <img
                src={c.resolutionImage}
                alt={`Escena de resolución recreada: ${c.title}`}
              />
              <span>RECREACIÓN NARRATIVA / EXPEDIENTE {c.id}</span>
            </div>
            <div className={styles.resolutionEvidence}>
              <span className={styles.eyebrow}>TRES PRUEBAS DECISIVAS</span>
              <div>
                {c.resolution.decisiveEvidence.slice(0, 3).map((id, i) => {
                  const item = c.visualEvidence.find((item) => item.id === id);
                  return item ? (
                    <button key={id} onClick={() => openEvidence(item)}>
                      <span>0{i + 1}</span>
                      <h3>{item.title}</h3>
                      <p>{item.observation}</p>
                      <span className={styles.textButton}>
                        Revisar prueba <ArrowRight size={16} />
                      </span>
                    </button>
                  ) : null;
                })}
              </div>
            </div>
            <div className={styles.solutionMapping}>
              <span className={styles.eyebrow}>DEDUCCIONES DEL EXPEDIENTE</span>
              {c.entities.map((entity, index) => (
                <div key={entity}>
                  <span>{entity}</span>
                  <ArrowRight size={17} />
                  <strong>{c.categories[c.solution[index]]}</strong>
                </div>
              ))}
            </div>
            <div className={styles.method}>
              <div>
                <span className={styles.eyebrow}>TÉCNICA OSINT</span>
                <h2>{c.resolution.technique}</h2>
                <p>{c.resolution.uncertainty}</p>
              </div>
              <div>
                <span className={styles.eyebrow}>FUENTES Y HERRAMIENTAS</span>
                {c.sourceLinks.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.label}
                    <ArrowRight size={17} />
                  </a>
                ))}
                {c.osintTools.map((tool) => (
                  <a
                    key={tool.url}
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {tool.name}
                    <ArrowRight size={17} />
                  </a>
                ))}
              </div>
            </div>
            <details className={styles.realStory}>
              <summary>
                {c.sourceType === "simulation"
                  ? "Qué enseña esta simulación"
                  : "Cómo se investigó realmente"}
                <Plus size={19} />
              </summary>
              <p>{c.resolution.realStory}</p>
              <p className={styles.disclaimer}>
                Las fechas, imágenes y relaciones del juego son reconstrucciones
                educativas. Consulta las fuentes para conocer los hechos
                documentados.
              </p>
            </details>
            <div className={styles.training}>
              <span className={styles.eyebrow}>
                DEL JUEGO A LA INVESTIGACIÓN
              </span>
              <h2>¿Quieres aprender a hacerlo tú?</h2>
              <p>
                Aprende a buscar información pública, verificar imágenes y
                documentar tus investigaciones mediante técnicas OSINT.
              </p>
              <a
                className={styles.primaryButton}
                href={c.relatedCourse}
                target="_blank"
                rel="noreferrer"
              >
                Descubrir la formación OSINT <ArrowRight size={19} />
              </a>
              <span>
                Consulta el programa y las condiciones del certificado en
                Perinfor.
              </span>
            </div>
            <div className={styles.stageFooter}>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate("board")}
              >
                Revisar deducciones
              </button>
              <Link className={styles.primaryButton} to="/casos">
                Investigar otro caso <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}
      </motion.div>
      {progress.phase !== "cover" && progress.phase !== "resolution" && (
        <div className={styles.revealFooter}>
          <span>
            {sourceLabel}. Nada sustituye a contrastar la fuente original.
          </span>
          <button
            onClick={() => {
              if (progress.solved && !progress.revealed) navigate("resolution");
              else setConfirmation("reveal");
            }}
          >
            <Eye size={16} /> Ver resolución
          </button>
        </div>
      )}
      {evidence && (
        <EvidenceViewer evidence={evidence} onClose={() => setEvidence(null)} />
      )}
      {confirmation && (
        <Dialog
          title={
            confirmation === "reveal"
              ? "¿Quieres revelar la solución?"
              : "¿Reiniciar el tablero?"
          }
          onClose={() => setConfirmation(null)}
        >
          <p className={styles.confirmationText}>
            {confirmation === "reveal"
              ? "Esta acción revelará la solución y no contará como caso resuelto. Tu progreso seguirá guardado y podrás revisar las pruebas."
              : "Se borrarán las relaciones del tablero y su historial. Las evidencias examinadas y las pistas se conservarán."}
          </p>
          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              onClick={() => setConfirmation(null)}
            >
              Continuar investigando
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => {
                if (confirmation === "reveal") reveal();
                else {
                  update({ grid: createGrid(c.entities.length), history: [] });
                  setSequence(c.entities.map((_, i) => i));
                  setConfirmation(null);
                  setFeedback("Tablero reiniciado.");
                }
              }}
            >
              {confirmation === "reveal"
                ? "Revelar solución"
                : "Reiniciar relaciones"}
            </button>
          </div>
        </Dialog>
      )}
    </article>
  );
}
