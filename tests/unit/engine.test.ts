import { describe, it, expect } from 'vitest';
import type { Constraint } from '../../src/cases/schema';
import { assignmentToGrid, checkGrid, createGrid, setCell } from '../../src/game/engine';
import { satisfiesConstraint } from '../../src/game/constraints';
import { solve } from '../../src/game/solver';
import { isVictory, score } from '../../src/game/scoring';

describe('deduction engine', () => {
  it('keeps all four cell states independent and immutable', () => {
    const initial = createGrid(3);
    let next = initial;
    for (const state of ['possible', 'excluded', 'confirmed', 'unknown'] as const) {
      const previous = next;
      next = setCell(next, 1, 2, state);
      expect(next[1][2]).toBe(state);
      expect(next).not.toBe(previous);
      expect(next[0]).not.toBe(previous[0]);
    }
    expect(initial).toEqual(createGrid(3));
    const confirmed = setCell(initial, 0, 0, 'confirmed');
    expect(confirmed[0][1]).toBe('unknown'); // All deductions remain explicit.
    expect(() => setCell(initial, 3, 0, 'possible')).toThrow(RangeError);
  });
  it('rejects wrong confirmations and exclusions of necessary relationships', () => {
    const solution = [2, 0, 1];
    expect(checkGrid(createGrid(3), solution)).toMatchObject({ solved: false, conflicts: 0, confirmed: 0 });
    const wrong = setCell(setCell(createGrid(3), 0, 1, 'confirmed'), 1, 0, 'excluded');
    expect(checkGrid(wrong, solution)).toMatchObject({ solved: false, conflicts: 2, confirmed: 1 });
    const solved = assignmentToGrid(solution);
    expect(checkGrid(solved, solution)).toMatchObject({ solved: true, conflicts: 0, confirmed: 3 });
    expect(checkGrid(setCell(solved, 0, 0, 'confirmed'), solution).solved).toBe(false);
    expect(checkGrid(setCell(solved, 0, 2, 'possible'), solution).solved).toBe(false);
  });
  it('does not accept malformed grids or non-bijective assignments', () => {
    expect(checkGrid([['unknown']], [0, 1, 2]).solved).toBe(false);
    expect(() => assignmentToGrid([0, 0, 2])).toThrow();
    expect(() => createGrid(0)).toThrow();
    expect(() => assignmentToGrid([0, 1, 4])).toThrow();
  });
});

describe('constraint solver', () => {
  const clue = (constraint: Omit<Extract<Constraint, { type: 'is' | 'isNot' }>, 'evidenceId'>): Constraint => ({ ...constraint, evidenceId: 'a' });
  it('enumerates all possible assignments rather than consulting the declared solution', () => {
    expect(solve([], 3)).toHaveLength(6);
    const constraints: Constraint[] = [
      clue({ type: 'isNot', entity: 0, category: 0 }),
      { type: 'before', first: 1, second: 0, evidenceId: 'b' },
      { type: 'nextTo', first: 0, second: 2, evidenceId: 'c' },
      clue({ type: 'is', entity: 2, category: 2 }),
    ];
    expect(solve(constraints, 3)).toEqual([[1, 0, 2]]);
    expect(solve([...constraints, clue({ type: 'is', entity: 0, category: 0 })], 3)).toEqual([]);
  });
  it('checks each constraint type, ordering and adjacency', () => {
    expect(satisfiesConstraint([2, 0, 1], { type: 'is', entity: 0, category: 2, evidenceId: 'a' })).toBe(true);
    expect(satisfiesConstraint([2, 0, 1], { type: 'isNot', entity: 0, category: 2, evidenceId: 'a' })).toBe(false);
    expect(satisfiesConstraint([2, 0, 1], { type: 'before', first: 1, second: 0, evidenceId: 'a' })).toBe(true);
    expect(satisfiesConstraint([2, 0, 1], { type: 'nextTo', first: 0, second: 1, evidenceId: 'a' })).toBe(false);
    expect(() => solve([{ type: 'is', entity: 3, category: 0, evidenceId: 'a' }], 3)).toThrow(RangeError);
    expect(() => solve([], 5)).toThrow(RangeError);
  });
});

describe('resolution scoring', () => {
  it('never grants a victory or points after revealing a solution', () => {
    expect(isVictory({ solved: true, revealed: true })).toBe(false);
    expect(score({ solved: true, revealed: true, hintsUsed: 0 })).toBe(0);
    expect(score({ solved: false, revealed: false, hintsUsed: 0 })).toBe(0);
    expect(score({ solved: true, revealed: false, hintsUsed: 2 })).toBe(70);
  });
});
