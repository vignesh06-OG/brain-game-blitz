/**
 * Mastery challenges.
 *
 * Every challenge below is derived purely from data the game already records:
 * the player's best move count per level (`Progress`) and the solver-proven
 * par for each board. Nothing here is estimated or self-reported — a challenge
 * is complete only when the stored solves genuinely satisfy it.
 */

import { CHAPTERS, LEVELS } from "./levels";
import type { Progress } from "./progress";

export type Mastery = {
  id: string;
  title: string;
  /** What the player has to do, in plain language. */
  detail: string;
  done: number;
  total: number;
  complete: boolean;
};

const solvedAtPar = (progress: Progress, levelId: string, par: number) => {
  const best = progress[levelId];
  return best !== undefined && best <= par;
};

export function computeMastery(progress: Progress): Mastery[] {
  const list: Mastery[] = [];

  // One challenge per chapter: reach the solver's proven minimum everywhere.
  for (const chapter of CHAPTERS) {
    const levels = LEVELS.filter((l) => l.chapter === chapter.n);
    if (levels.length === 0) continue;
    const done = levels.filter((l) => solvedAtPar(progress, l.id, l.par)).length;
    list.push({
      id: `par-ch${chapter.n}`,
      title: `${chapter.name} — proven minimum`,
      detail: `Solve every puzzle in Chapter ${chapter.n} in par moves or fewer.`,
      done,
      total: levels.length,
      complete: done === levels.length,
    });
  }

  // Campaign-wide completion.
  const solved = LEVELS.filter((l) => progress[l.id] !== undefined).length;
  list.push({
    id: "campaign",
    title: "Full bench",
    detail: "Solve every puzzle in the campaign at least once.",
    done: solved,
    total: LEVELS.length,
    complete: solved === LEVELS.length,
  });

  // The deepest boards, at par.
  const deep = LEVELS.filter((l) => l.par >= 6);
  const deepDone = deep.filter((l) => solvedAtPar(progress, l.id, l.par)).length;
  list.push({
    id: "deep-par",
    title: "Six moves or more, exactly",
    detail: "Reach par on every puzzle whose proven minimum is six moves or longer.",
    done: deepDone,
    total: deep.length,
    complete: deep.length > 0 && deepDone === deep.length,
  });

  // Boards with more than one optimal route — worth revisiting.
  const multi = LEVELS.filter((l) => (l.solutions ?? 1) > 1);
  const multiDone = multi.filter((l) => solvedAtPar(progress, l.id, l.par)).length;
  if (multi.length > 0) {
    list.push({
      id: "multi-par",
      title: "More than one way",
      detail: "Reach par on every board the solver proved has several optimal routes.",
      done: multiDone,
      total: multi.length,
      complete: multiDone === multi.length,
    });
  }

  return list;
}
