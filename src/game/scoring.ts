import type { CaseProgress } from "./persistence";
export function isVictory(
  progress: Pick<CaseProgress, "solved" | "revealed">,
): boolean {
  return progress.solved && !progress.revealed;
}
/** Learning is rewarded without awarding a victory for revealing the answer. */
export function score(
  progress: Pick<CaseProgress, "solved" | "revealed" | "hintsUsed">,
): number {
  return isVictory(progress)
    ? Math.max(40, 100 - Math.min(3, progress.hintsUsed) * 15)
    : 0;
}
