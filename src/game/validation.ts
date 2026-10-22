import { caseSchema, type Investigation } from "../cases/schema";
import { solve } from "./solver";

export function validateCase(investigation: Investigation): void {
  const data = caseSchema.parse(investigation);
  const fail = (message: string): never => {
    throw new Error(`Expediente ${data.id}: ${message}`);
  };
  const size = data.entities.length;
  if (data.categories.length !== size || data.solution.length !== size)
    fail("Las dimensiones del tablero no coinciden.");
  if (
    new Set(data.entities).size !== size ||
    new Set(data.categories).size !== size
  )
    fail("Los encabezados del tablero deben ser únicos.");
  const evidenceIds = new Set(
    data.visualEvidence.map((evidence) => evidence.id),
  );
  if (
    data.entityEvidenceIds.length !== size ||
    data.entityEvidenceIds.some((id) => !evidenceIds.has(id))
  )
    fail("Cada fila debe mostrar una evidencia existente y pertinente.");
  if (evidenceIds.size !== data.visualEvidence.length)
    fail("Hay identificadores de evidencia duplicados.");
  const referenced = [
    ...data.constraints.map((constraint) => constraint.evidenceId),
    ...data.logicalClues.map((clue) => clue.evidenceId),
    ...data.hintLevels.map((hint) => hint.evidenceId),
    ...data.hotspots.map((hotspot) => hotspot.evidenceId),
    ...data.resolution.decisiveEvidence,
  ];
  if (referenced.some((id) => !evidenceIds.has(id)))
    fail(
      "Una pista, restricción o resolución hace referencia a una evidencia inexistente.",
    );
  if (
    data.visualEvidence.some(
      (evidence) =>
        !data.constraints.some(
          (constraint) => constraint.evidenceId === evidence.id,
        ),
    )
  )
    fail("Cada evidencia principal debe respaldar una restricción.");
  if (
    new Set(data.hintLevels.map((hint) => hint.level)).size !== 3 ||
    data.hintLevels.some((hint) => ![1, 2, 3].includes(hint.level))
  )
    fail("Las pistas deben cubrir los niveles 1, 2 y 3.");
  if (
    data.hotspots.some(
      (hotspot) =>
        hotspot.x < 0 || hotspot.x > 100 || hotspot.y < 0 || hotspot.y > 100,
    )
  )
    fail("Un detalle está fuera de la escena.");
  const solutions = solve(data.constraints, size);
  if (solutions.length !== 1)
    fail(
      `El puzzle debe tener exactamente una solución; se han encontrado ${solutions.length}.`,
    );
  if (solutions[0].some((value, index) => value !== data.solution[index]))
    fail("La solución declarada no satisface las restricciones.");
  if (
    !data.verdict.options.some((option) => option.id === data.verdict.correctId)
  )
    fail("El veredicto correcto no existe.");
  if (
    new Set(data.verdict.options.map((option) => option.id)).size !==
    data.verdict.options.length
  )
    fail("Hay opciones de veredicto duplicadas.");
}
