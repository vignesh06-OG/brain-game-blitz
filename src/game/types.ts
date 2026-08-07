export type Dir = 0 | 1 | 2 | 3; // 0 = north, 1 = east, 2 = south, 3 = west

/** Colour is an additive RGB bitmask: 1 = red, 2 = green, 4 = blue. */
export type ColorMask = number;

export const RED = 1;
export const GREEN = 2;
export const BLUE = 4;
export const WHITE = 7;

export type PieceKind =
  | "emitter"
  | "target"
  | "mirror"
  | "splitter"
  | "filter"
  | "prism"
  | "wall";

export interface Piece {
  id: string;
  kind: PieceKind;
  /** For mirrors/splitters/prisms: 0 = "/", 1 = "\". For emitters: the Dir it fires. */
  rot: number;
  /** Emitter beam colour, target required colour, filter pass mask. */
  color?: ColorMask;
  /** Fixed pieces cannot be rotated, moved or removed by the player. */
  fixed?: boolean;
}

export interface Board {
  width: number;
  height: number;
  /** Keyed by `${x},${y}` */
  cells: Record<string, Piece>;
  /** Pieces the player still has to place. */
  tray: Piece[];
}

export interface Level {
  id: string;
  chapter: number;
  index: number;
  name: string;
  hint: string;
  /** Introduces a new mechanic — shown as a teaching card. */
  teaches?: string;
  par: number;
  board: Board;
}

/** Live telemetry for a single beam edge — powers the beam inspector. */
export interface SegmentMeta {
  /** Cell keys of every emitter whose light reaches this edge. */
  sources: string[];
  /** Shortest hop count from an emitter to this edge. */
  distance: number;
  /** Reflections the light took to get here (mirrors + splitters). */
  reflections: number;
  /** Splits (splitters / prisms) the light passed through. */
  splits: number;
  /** Relative intensity, 1 = untouched emitter output. */
  intensity: number;
  /** Directions of travel across this edge, as a Dir bitmask. */
  dirs: number;
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: ColorMask;
  meta?: SegmentMeta;
}


export interface TraceResult {
  segments: Segment[];
  /** Colour delivered into each target cell, keyed by `${x},${y}` */
  hits: Record<string, ColorMask>;
  solved: boolean;
  targetCount: number;
  solvedCount: number;
}

export const key = (x: number, y: number) => `${x},${y}`;
export const parseKey = (k: string): [number, number] => {
  const parts = k.split(",");
  return [Number(parts[0]), Number(parts[1])];
};

export const DELTA: Record<Dir, [number, number]> = {
  0: [0, -1],
  1: [1, 0],
  2: [0, 1],
  3: [-1, 0],
};
