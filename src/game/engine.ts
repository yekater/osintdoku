/** A cell is a player's explicit assertion. No hidden deductions are applied. */
export type CellState = "unknown" | "possible" | "excluded" | "confirmed";
export type Grid = CellState[][];
export const CELL_STATES: readonly CellState[] = [
  "unknown",
  "possible",
  "excluded",
  "confirmed",
];

export function createGrid(size: number): Grid {
  if (!Number.isInteger(size) || size < 1 || size > 8)
    throw new RangeError("El tablero debe tener entre 1 y 8 elementos.");
  return Array.from({ length: size }, () =>
    Array<CellState>(size).fill("unknown"),
  );
}

export function setCell(
  grid: Grid,
  row: number,
  col: number,
  state: CellState,
): Grid {
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    !grid[row] ||
    col < 0 ||
    col >= grid[row].length
  )
    throw new RangeError("Celda fuera del tablero.");
  if (!CELL_STATES.includes(state))
    throw new TypeError("Estado de celda desconocido.");
  return grid.map((cells, index) =>
    index === row
      ? cells.map((cell, column) => (column === col ? state : cell))
      : [...cells],
  );
}

export function assignmentToGrid(assignment: number[]): Grid {
  const size = assignment.length;
  createGrid(size);
  if (
    new Set(assignment).size !== size ||
    assignment.some(
      (value) => !Number.isInteger(value) || value < 0 || value >= size,
    )
  )
    throw new TypeError("La asignación debe ser una correspondencia única.");
  return assignment.map((selected) =>
    Array.from(
      { length: size },
      (_, column): CellState =>
        column === selected ? "confirmed" : "excluded",
    ),
  );
}

export interface GridCheck {
  solved: boolean;
  conflicts: number;
  confirmed: number;
  message: string;
}
export function checkGrid(grid: Grid, solution: number[]): GridCheck {
  const size = solution.length;
  if (
    size === 0 ||
    grid.length !== size ||
    grid.some(
      (row) =>
        row.length !== size || row.some((cell) => !CELL_STATES.includes(cell)),
    )
  ) {
    return {
      solved: false,
      conflicts: 1,
      confirmed: 0,
      message: "El tablero no tiene el formato esperado.",
    };
  }
  let conflicts = 0;
  let confirmed = 0;
  grid.forEach((row, entity) =>
    row.forEach((cell, category) => {
      if (cell === "confirmed") {
        confirmed += 1;
        if (solution[entity] !== category) conflicts += 1;
      }
      if (cell === "excluded" && solution[entity] === category) conflicts += 1;
    }),
  );
  const solved =
    conflicts === 0 &&
    confirmed === size &&
    solution.every(
      (category, entity) => grid[entity][category] === "confirmed",
    );
  const message =
    conflicts > 0
      ? `Hay ${conflicts} ${conflicts === 1 ? "relación incompatible" : "relaciones incompatibles"} con las pruebas. Revisa las evidencias.`
      : solved
        ? "Todas las relaciones están respaldadas. Puedes emitir tu veredicto."
        : `Sin contradicciones por ahora. Has confirmado ${confirmed} de ${size} relaciones.`;
  return { solved, conflicts, confirmed, message };
}
