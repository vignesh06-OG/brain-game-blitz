import {
  DELTA,
  key,
  type Board,
  type ColorMask,
  type Dir,
  type Piece,
  type Segment,
  type SegmentMeta,
  type TraceResult,
} from "./types";

const reflectSlash: Record<Dir, Dir> = { 0: 1, 1: 0, 2: 3, 3: 2 };
const reflectBackslash: Record<Dir, Dir> = { 0: 3, 3: 0, 2: 1, 1: 2 };

export const reflect = (dir: Dir, rot: number): Dir =>
  rot % 2 === 0 ? reflectSlash[dir] : reflectBackslash[dir];

interface Ray {
  x: number;
  y: number;
  dir: Dir;
  color: ColorMask;
  /** Telemetry carried along the ray so every edge knows its history. */
  src: string;
  dist: number;
  refl: number;
  splits: number;
}

const MAX_STEPS = 4000;

const newMeta = (ray: Ray): SegmentMeta => ({
  sources: [ray.src],
  distance: ray.dist,
  reflections: ray.refl,
  splits: ray.splits,
  intensity: 1 / 2 ** Math.min(ray.splits, 10),
  dirs: 1 << ray.dir,
});

const mergeMeta = (a: SegmentMeta, b: SegmentMeta): SegmentMeta => ({
  sources: a.sources.includes(b.sources[0]!) ? a.sources : [...a.sources, ...b.sources],
  distance: Math.min(a.distance, b.distance),
  reflections: Math.max(a.reflections, b.reflections),
  splits: Math.max(a.splits, b.splits),
  intensity: Math.min(1, a.intensity + b.intensity),
  dirs: a.dirs | b.dirs,
});

/**
 * Pure beam tracer: (board) => beams. Deterministic, used by the renderer,
 * the puzzle validator, the studio editor and the sandbox alike.
 */
export function trace(board: Board): TraceResult {
  const segments: Segment[] = [];
  const hits: Record<string, ColorMask> = {};
  const seen = new Set<string>();
  const queue: Ray[] = [];

  for (const [k, piece] of Object.entries(board.cells)) {
    if (piece.kind === "emitter") {
      const parts = k.split(",");
      queue.push({
        x: Number(parts[0]),
        y: Number(parts[1]),
        dir: (piece.rot % 4) as Dir,
        color: piece.color ?? 7,
        src: k,
        dist: 0,
        refl: 0,
        splits: 0,
      });
    }
  }

  let steps = 0;
  while (queue.length && steps < MAX_STEPS) {
    const ray = queue.shift()!;
    steps++;
    if (!ray.color) continue;

    const rayKey = `${ray.x},${ray.y},${ray.dir},${ray.color}`;
    if (seen.has(rayKey)) continue;
    seen.add(rayKey);

    const [dx, dy] = DELTA[ray.dir];
    const nx = ray.x + dx;
    const ny = ray.y + dy;
    if (nx < 0 || ny < 0 || nx >= board.width || ny >= board.height) continue;

    const next = { ...ray, x: nx, y: ny, dist: ray.dist + 1 };
    segments.push({
      x1: ray.x,
      y1: ray.y,
      x2: nx,
      y2: ny,
      color: ray.color,
      meta: newMeta(next),
    });

    const piece: Piece | undefined = board.cells[key(nx, ny)];
    if (!piece) {
      queue.push(next);
      continue;
    }

    switch (piece.kind) {
      case "wall":
      case "emitter":
        break;
      case "target": {
        const k = key(nx, ny);
        hits[k] = (hits[k] ?? 0) | ray.color;
        break;
      }
      case "mirror":
        queue.push({
          ...next,
          dir: reflect(ray.dir, piece.rot),
          refl: ray.refl + 1,
        });
        break;
      case "splitter":
        queue.push({ ...next, splits: ray.splits + 1 });
        queue.push({
          ...next,
          dir: reflect(ray.dir, piece.rot),
          refl: ray.refl + 1,
          splits: ray.splits + 1,
        });
        break;
      case "filter": {
        const passed = ray.color & (piece.color ?? 7);
        if (passed) queue.push({ ...next, color: passed });
        break;
      }
      case "prism": {
        // Splits a beam into its components: red goes straight,
        // green reflects one way, blue the other.
        if (ray.color & 1)
          queue.push({ ...next, color: 1, splits: ray.splits + 1 });
        if (ray.color & 2)
          queue.push({
            ...next,
            color: 2,
            dir: reflect(ray.dir, 0),
            refl: ray.refl + 1,
            splits: ray.splits + 1,
          });
        if (ray.color & 4)
          queue.push({
            ...next,
            color: 4,
            dir: reflect(ray.dir, 1),
            refl: ray.refl + 1,
            splits: ray.splits + 1,
          });
        break;
      }
    }
  }

  // Merge overlapping segments so crossing beams mix colour.
  const merged = new Map<string, Segment>();
  for (const s of segments) {
    const a = `${s.x1},${s.y1}`;
    const b = `${s.x2},${s.y2}`;
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    const existing = merged.get(k);
    if (existing) {
      existing.color |= s.color;
      if (existing.meta && s.meta) existing.meta = mergeMeta(existing.meta, s.meta);
    } else {
      const copy: Segment = { x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, color: s.color };
      if (s.meta) copy.meta = { ...s.meta };
      merged.set(k, copy);
    }

  }

  let targetCount = 0;
  let solvedCount = 0;
  for (const [k, piece] of Object.entries(board.cells)) {
    if (piece.kind !== "target") continue;
    targetCount++;
    if ((hits[k] ?? 0) === (piece.color ?? 7)) solvedCount++;
  }

  return {
    segments: [...merged.values()],
    hits,
    solved: targetCount > 0 && solvedCount === targetCount,
    targetCount,
    solvedCount,
  };
}

export const colorVar = (mask: ColorMask): string => {
  switch (mask & 7) {
    case 1:
      return "var(--beam-red)";
    case 2:
      return "var(--beam-green)";
    case 4:
      return "var(--beam-blue)";
    case 3:
      return "var(--beam-yellow)";
    case 5:
      return "var(--beam-magenta)";
    case 6:
      return "var(--beam-cyan)";
    case 7:
      return "var(--beam-white)";
    default:
      return "var(--beam-dark)";
  }
};

export const colorName = (mask: ColorMask): string =>
  ({ 1: "Red", 2: "Green", 4: "Blue", 3: "Yellow", 5: "Magenta", 6: "Cyan", 7: "White" })[
    mask & 7
  ] ?? "None";

/** Distinct glyph per colour so the game is playable without colour vision. */
export const colorGlyph = (mask: ColorMask): string =>
  ({ 1: "▲", 2: "■", 4: "●", 3: "◆", 5: "✦", 6: "⬢", 7: "★" })[mask & 7] ?? "·";

export const DIR_NAME = ["north", "east", "south", "west"] as const;

/** Human-readable list of travel directions from a Dir bitmask. */
export const dirNames = (mask: number): string =>
  DIR_NAME.filter((_, i) => mask & (1 << i)).join(" + ") || "—";

export const cloneBoard = (board: Board): Board => ({
  width: board.width,
  height: board.height,
  cells: Object.fromEntries(
    Object.entries(board.cells).map(([k, p]) => [k, { ...p }]),
  ),
  tray: board.tray.map((p) => ({ ...p })),
});
