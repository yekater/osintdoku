import type { Investigation } from "../cases/schema";
export function visibleHints(investigation: Investigation, used: number) {
  return [...investigation.hintLevels]
    .sort((a, b) => a.level - b.level)
    .slice(0, Math.max(0, Math.min(3, used)));
}
