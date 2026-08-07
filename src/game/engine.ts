import {
  DELTA,
  key,
  type Board,
  type ColorMask,
  type Dir,
  type Piece,
  type Segment,
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
}

const MAX_STEPS = 4000;

/**
 * Pure beam tracer: (board) => beams. Deterministic, used by the renderer,
 * the level validator and the daily puzzle generator alike.
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

    segments.push({ x1: ray.x, y1: ray.y, x2: nx, y2: ny, color: ray.color });

    const piece: Piece | undefined = board.cells[key(nx, ny)];
    if (!piece) {
      queue.push({ x: nx, y: ny, dir: ray.dir, color: ray.color });
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
        queue.push({ x: nx, y: ny, dir: reflect(ray.dir, piece.rot), color: ray.color });
        break;
      case "splitter":
        queue.push({ x: nx, y: ny, dir: ray.dir, color: ray.color });
        queue.push({ x: nx, y: ny, dir: reflect(ray.dir, piece.rot), color: ray.color });
        break;
      case "filter": {
        const passed = ray.color & (piece.color ?? 7);
        if (passed) queue.push({ x: nx, y: ny, dir: ray.dir, color: passed });
        break;
      }
      case "prism": {
        // Splits a beam into its components: red goes straight,
        // green reflects one way, blue the other.
        if (ray.color & 1) queue.push({ x: nx, y: ny, dir: ray.dir, color: 1 });
        if (ray.color & 2)
          queue.push({ x: nx, y: ny, dir: reflect(ray.dir, 0), color: 2 });
        if (ray.color & 4)
          queue.push({ x: nx, y: ny, dir: reflect(ray.dir, 1), color: 4 });
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
    if (existing) existing.color |= s.color;
    else merged.set(k, { ...s });
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

export const cloneBoard = (board: Board): Board => ({
  width: board.width,
  height: board.height,
  cells: Object.fromEntries(
    Object.entries(board.cells).map(([k, p]) => [k, { ...p }]),
  ),
  tray: board.tray.map((p) => ({ ...p })),
});
