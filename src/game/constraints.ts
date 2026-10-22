import type { Constraint } from "../cases/schema";

/** Categories are ordered positions for before/nextTo constraints. */
export function satisfiesConstraint(
  assignment: number[],
  constraint: Constraint,
): boolean {
  switch (constraint.type) {
    case "is":
      return assignment[constraint.entity] === constraint.category;
    case "isNot":
      return assignment[constraint.entity] !== constraint.category;
    case "before":
      return assignment[constraint.first] < assignment[constraint.second];
    case "nextTo":
      return (
        Math.abs(
          assignment[constraint.first] - assignment[constraint.second],
        ) === 1
      );
  }
}

export function validateConstraintIndices(
  constraint: Constraint,
  size: number,
): boolean {
  const indices =
    constraint.type === "is" || constraint.type === "isNot"
      ? [constraint.entity, constraint.category]
      : [constraint.first, constraint.second];
  return indices.every(
    (value) => Number.isInteger(value) && value >= 0 && value < size,
  );
}
