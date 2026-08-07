const KEY = "prism.progress.v1";

/** levelId -> best move count */
export type Progress = Record<string, number>;

export function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}

export function recordSolve(levelId: string, moves: number): Progress {
  const progress = loadProgress();
  const best = progress[levelId];
  if (best === undefined || moves < best) progress[levelId] = moves;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage unavailable */
  }
  return progress;
}

const PREFS = "prism.prefs.v1";

export interface Prefs {
  colorblind: boolean;
  reduceMotion: boolean;
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return { colorblind: false, reduceMotion: false };
  try {
    return {
      colorblind: false,
      reduceMotion: false,
      ...(JSON.parse(window.localStorage.getItem(PREFS) ?? "{}") as Partial<Prefs>),
    };
  } catch {
    return { colorblind: false, reduceMotion: false };
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(PREFS, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
}
