import { CELL_STATES, createGrid, type Grid } from "./engine";
export type Phase =
  | "cover"
  | "briefing"
  | "scene"
  | "evidence"
  | "board"
  | "verdict"
  | "resolution";
export interface CaseProgress {
  phase: Phase;
  examined: string[];
  discovered: string[];
  grid: Grid;
  hintsUsed: number;
  solved: boolean;
  revealed: boolean;
  verdictId: string | null;
  startedAt: number;
  history: Grid[];
}
export const STORAGE_KEY = "osintdoku_progress_v5";
export const LEGACY_KEY = "osintdoku_progress";
const VERSION = 5;
const PHASES: readonly Phase[] = [
  "cover",
  "briefing",
  "scene",
  "evidence",
  "board",
  "verdict",
  "resolution",
];
interface Store {
  version: number;
  cases: Record<string, CaseProgress>;
  legacy: { completedIds: string[]; migratedAt: number } | null;
}

export function freshProgress(size: number): CaseProgress {
  return {
    phase: "cover",
    examined: [],
    discovered: [],
    grid: createGrid(size),
    hintsUsed: 0,
    solved: false,
    revealed: false,
    verdictId: null,
    startedAt: Date.now(),
    history: [],
  };
}
function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isGrid(value: unknown, size: number): value is Grid {
  return (
    Array.isArray(value) &&
    value.length === size &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === size &&
        row.every((cell) => CELL_STATES.includes(cell)),
    )
  );
}
function stringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string") &&
    value.length < 1000
  );
}
function validProgress(
  value: unknown,
  expectedSize?: number,
): value is CaseProgress {
  if (!isRecord(value) || !Array.isArray(value.grid)) return false;
  const size = expectedSize ?? value.grid.length;
  return (
    size >= 3 &&
    size <= 4 &&
    isGrid(value.grid, size) &&
    PHASES.includes(value.phase as Phase) &&
    stringList(value.examined) &&
    stringList(value.discovered) &&
    Number.isInteger(value.hintsUsed) &&
    Number(value.hintsUsed) >= 0 &&
    Number(value.hintsUsed) <= 3 &&
    typeof value.solved === "boolean" &&
    typeof value.revealed === "boolean" &&
    (value.verdictId === null || typeof value.verdictId === "string") &&
    typeof value.startedAt === "number" &&
    Number.isFinite(value.startedAt) &&
    value.startedAt >= 0 &&
    Array.isArray(value.history) &&
    value.history.length <= 100 &&
    value.history.every((grid) => isGrid(grid, size))
  );
}
function legacySummary(raw: string | null): Store["legacy"] {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) && !Array.isArray(parsed)) return null;
    const entries = Object.entries(parsed);
    const completedIds = entries
      .filter(
        ([, value]) =>
          value === true ||
          (isRecord(value) &&
            (value.solved === true || value.completed === true)),
      )
      .map(([key]) => key)
      .filter((key) => key.length < 100);
    return { completedIds, migratedAt: Date.now() };
  } catch {
    return null;
  }
}
function readStore(): Store {
  const empty: Store = { version: VERSION, cases: {}, legacy: null };
  const target = storage();
  if (!target) return empty;
  try {
    const raw = target.getItem(STORAGE_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (
        isRecord(value) &&
        value.version === VERSION &&
        isRecord(value.cases)
      ) {
        const cases: Record<string, CaseProgress> = {};
        for (const [key, progress] of Object.entries(value.cases))
          if (key !== "__proto__" && validProgress(progress))
            cases[key] = progress;
        return {
          version: VERSION,
          cases,
          legacy:
            isRecord(value.legacy) &&
            stringList(value.legacy.completedIds) &&
            typeof value.legacy.migratedAt === "number"
              ? (value.legacy as Store["legacy"])
              : null,
        };
      }
      // Preserve unsupported future data. A later save will refuse to overwrite it.
    }
  } catch {
    /* Corrupt storage never prevents playing. */
  }
  try {
    return { ...empty, legacy: legacySummary(target.getItem(LEGACY_KEY)) };
  } catch {
    return empty;
  }
}
function writeStore(value: Store): boolean {
  const target = storage();
  if (!target) return false;
  try {
    const previous = target.getItem(STORAGE_KEY);
    if (previous) {
      let existing: unknown;
      try {
        existing = JSON.parse(previous);
      } catch {
        existing = null;
      }
      if (
        isRecord(existing) &&
        typeof existing.version === "number" &&
        existing.version > VERSION
      )
        return false;
      if (existing === null && !target.getItem(`${STORAGE_KEY}_corrupt_backup`))
        target.setItem(`${STORAGE_KEY}_corrupt_backup`, previous);
    }
    target.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function loadProgress(caseId: string, size: number): CaseProgress {
  const state = readStore();
  const progress = state.cases[caseId];
  if (!progress || !validProgress(progress, size)) return freshProgress(size);
  // A revealed resolution can never be promoted to a win by an older or malformed save.
  return { ...progress, solved: progress.solved && !progress.revealed };
}
export function loadAllProgress(): Record<string, CaseProgress> {
  const cases = readStore().cases;
  return Object.fromEntries(
    Object.entries(cases).map(([key, value]) => [
      key,
      { ...value, solved: value.solved && !value.revealed },
    ]),
  );
}
export function saveProgress(caseId: string, progress: CaseProgress): boolean {
  const candidate = {
    ...progress,
    history: Array.isArray(progress.history)
      ? progress.history.slice(-100)
      : progress.history,
  };
  if (!caseId || caseId === "__proto__" || !validProgress(candidate))
    return false;
  const state = readStore();
  // Revealing an answer is sticky for this attempt, including board-only resets.
  // resetProgress is the explicit boundary for starting a completely new attempt.
  const revealed = candidate.revealed || state.cases[caseId]?.revealed === true;
  state.cases[caseId] = {
    ...candidate,
    revealed,
    solved: candidate.solved && !revealed,
  };
  return writeStore(state);
}
export function resetProgress(caseId: string): void {
  const state = readStore();
  delete state.cases[caseId];
  writeStore(state);
}
