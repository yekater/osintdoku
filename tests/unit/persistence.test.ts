import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { assignmentToGrid } from '../../src/game/engine';
import { freshProgress, loadAllProgress, loadProgress, resetProgress, saveProgress, STORAGE_KEY, LEGACY_KEY } from '../../src/game/persistence';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}
let store: MemoryStorage;
beforeEach(() => { store = new MemoryStorage(); vi.stubGlobal('localStorage', store); });
afterEach(() => vi.unstubAllGlobals());

describe('versioned local progress', () => {
  it('round-trips phases, evidence, hints, undo history and solved state', () => {
    const progress = { ...freshProgress(3), phase: 'resolution' as const, examined: ['a', 'b'], discovered: ['detail'], hintsUsed: 2, grid: assignmentToGrid([1, 2, 0]), history: [freshProgress(3).grid], verdictId: 'correct', solved: true };
    expect(saveProgress('001', progress)).toBe(true);
    expect(loadProgress('001', 3)).toEqual(progress);
    expect(loadAllProgress()['001'].solved).toBe(true);
    expect(JSON.parse(store.getItem(STORAGE_KEY)!).version).toBe(5);
    resetProgress('001');
    expect(loadAllProgress()['001']).toBeUndefined();
  });
  it('preserves valid legacy completions separately without completing new puzzles', () => {
    const old = JSON.stringify({ '001': { completed: true }, '002': true, '003': { solved: false } });
    store.setItem(LEGACY_KEY, old);
    expect(loadProgress('001', 3).solved).toBe(false);
    expect(saveProgress('001', freshProgress(3))).toBe(true);
    const current = JSON.parse(store.getItem(STORAGE_KEY)!);
    expect(current.legacy.completedIds).toEqual(['001', '002']);
    expect(current.cases['001'].solved).toBe(false);
    expect(store.getItem(LEGACY_KEY)).toBe(old);
  });
  it('recovers from malformed saved content while preserving a corrupt backup', () => {
    store.setItem(STORAGE_KEY, '{broken');
    expect(loadProgress('001', 3).grid).toHaveLength(3);
    expect(saveProgress('001', freshProgress(3))).toBe(true);
    expect(store.getItem(`${STORAGE_KEY}_corrupt_backup`)).toBe('{broken');
    const invalid = { ...freshProgress(3), grid: [['confirmed']] };
    store.setItem(STORAGE_KEY, JSON.stringify({ version: 5, cases: { '001': invalid } }));
    expect(loadAllProgress()).toEqual({});
    expect(loadProgress('001', 3).grid).toHaveLength(3);
  });
  it('does not overwrite progress from a future storage version', () => {
    const future = JSON.stringify({ version: 6, cases: { '001': { secretFormat: true } } });
    store.setItem(STORAGE_KEY, future);
    expect(saveProgress('001', freshProgress(3))).toBe(false);
    expect(store.getItem(STORAGE_KEY)).toBe(future);
  });
  it('rejects invalid dimensions and never restores revealed solutions as victories', () => {
    const progress = { ...freshProgress(3), phase: 'resolution' as const, solved: true, revealed: true };
    expect(saveProgress('001', progress)).toBe(true);
    expect(loadProgress('001', 3).solved).toBe(false);
    expect(loadAllProgress()['001'].solved).toBe(false);
    expect(loadProgress('001', 4).grid).toHaveLength(4);
  });
  it('keeps a reveal sticky across board resets until an explicit whole-attempt reset', () => {
    expect(saveProgress('001', { ...freshProgress(3), revealed: true })).toBe(true);
    expect(saveProgress('001', { ...freshProgress(3), solved: true, phase: 'resolution' })).toBe(true);
    expect(loadProgress('001', 3)).toMatchObject({ revealed: true, solved: false });
    resetProgress('001');
    expect(saveProgress('001', { ...freshProgress(3), solved: true, phase: 'resolution' })).toBe(true);
    expect(loadProgress('001', 3)).toMatchObject({ revealed: false, solved: true });
  });
  it('rejects prototype payloads and ignores malformed records without losing valid cases', () => {
    const progress = freshProgress(3);
    expect(saveProgress('__proto__', progress)).toBe(false);
    const cases = Object.fromEntries([['__proto__', progress], ['001', progress], ['002', { ...progress, hintsUsed: -1 }]]);
    store.setItem(STORAGE_KEY, JSON.stringify({ version: 5, cases }));
    expect(Object.keys(loadAllProgress())).toEqual(['001']);
    expect(Object.getPrototypeOf(loadAllProgress())).toBe(Object.prototype);
    expect(saveProgress('001', { ...progress, history: Array.from({ length: 110 }, () => progress.grid) })).toBe(true);
    expect(loadProgress('001', 3).history).toHaveLength(100);
  });
  it('allows gameplay when storage is denied or full and reports failed saves', () => {
    const denied = { getItem() { throw new Error('Storage denied'); }, setItem() { throw new Error('Storage full'); } };
    vi.stubGlobal('localStorage', denied);
    expect(loadProgress('001', 3).phase).toBe('cover');
    expect(saveProgress('001', freshProgress(3))).toBe(false);
    expect(() => resetProgress('001')).not.toThrow();
  });
});
