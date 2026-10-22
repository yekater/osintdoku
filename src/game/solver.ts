import type { Constraint } from "../cases/schema";
import { satisfiesConstraint, validateConstraintIndices } from "./constraints";

/** Exhaustively proves uniqueness for the small educational boards, independent of UI and declared solution. */
export function solve(constraints: Constraint[], size: number): number[][] {
  if (!Number.isInteger(size) || size < 1 || size > 4)
    throw new RangeError("El solucionador admite de 1 a 4 entidades.");
  if (
    constraints.some(
      (constraint) => !validateConstraintIndices(constraint, size),
    )
  )
    throw new RangeError(
      "Una restricción hace referencia a un índice inexistente.",
    );
  const solutions: number[][] = [];
  function visit(assignment: number[], available: number[]) {
    if (available.length === 0) {
      if (
        constraints.every((constraint) =>
          satisfiesConstraint(assignment, constraint),
        )
      )
        solutions.push(assignment);
      return;
    }
    available.forEach((value, index) =>
      visit(
        [...assignment, value],
        available.filter((_, position) => position !== index),
      ),
    );
  }
  visit(
    [],
    Array.from({ length: size }, (_, index) => index),
  );
  return solutions;
}
