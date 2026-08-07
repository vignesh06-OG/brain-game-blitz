/**
 * AI Puzzle Evolution — a deterministic generate-and-test loop. Candidates are
 * mutated from a seeded PRNG, traced by the same engine the game uses, verified
 * by the BFS solver, and scored by their genome. Unsolvable, trivial or
 * degenerate layouts are discarded. No language model is involved: the "AI" is
 * search plus a fitness function over the simulation.
 */
import { analyse, type Analysis } from "./analysis";
import { genome, type Genome } from "./genome";
import { key, type Board, type ColorMask, type Piece } from "./types";

export interface Candidate {
  board: Board;
  analysis: Analysis;
  genome: Genome;
  fitness: number;
  generation: number;
}

export interface EvolveOptions {
  seed?: number;
  /** Candidates to grow and test. */
  population?: number;
  width?: number;
  height?: number;
  /** Desired difficulty band, 0–100. */
  targetComplexity?: number;
}

/** mulberry32 — tiny deterministic PRNG so a seed always regrows the same set. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let uid = 0;
const piece = (p: Omit<Piece, "id">): Piece => ({ id: `g${(uid++).toString(36)}`, ...p });

const COLORS: ColorMask[] = [1, 2, 4, 3, 5, 6, 7];

function grow(rand: () => number, width: number, height: number, gen: number): Board {
  const cells: Record<string, Piece> = {};
  const free: string[] = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) free.push(key(x, y));

  const take = (): string => {
    const i = Math.floor(rand() * free.length);
    return free.splice(i, 1)[0]!;
  };

  const emitters = 1 + (rand() < 0.25 ? 1 : 0);
  for (let i = 0; i < emitters; i++) {
    cells[take()] = piece({
      kind: "emitter",
      rot: Math.floor(rand() * 4),
      color: rand() < 0.6 ? 7 : COLORS[Math.floor(rand() * 3)]!,
      fixed: true,
    });
  }

  const targets = 1 + (rand() < 0.45 ? 1 : 0);
  for (let i = 0; i < targets; i++) {
    cells[take()] = piece({
      kind: "target",
      rot: 0,
      color: COLORS[Math.floor(rand() * COLORS.length)]!,
      fixed: true,
    });
  }

  const mirrors = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < mirrors; i++) {
    cells[take()] = piece({ kind: "mirror", rot: Math.floor(rand() * 2) });
  }
  if (rand() < 0.5) cells[take()] = piece({ kind: "splitter", rot: Math.floor(rand() * 2) });
  if (rand() < 0.35) cells[take()] = piece({ kind: "prism", rot: 0 });
  if (rand() < 0.3)
    cells[take()] = piece({ kind: "filter", rot: 0, color: COLORS[Math.floor(rand() * 3)]! });
  if (rand() < 0.3 + gen * 0.05)
    cells[take()] = piece({ kind: rand() < 0.5 ? "glass" : "crystal", rot: 0, color: 7 });

  const walls = Math.floor(rand() * 3);
  for (let i = 0; i < walls; i++) cells[take()] = piece({ kind: "wall", rot: 0, fixed: true });

  const tray: Piece[] = [];
  if (rand() < 0.5) tray.push(piece({ kind: "mirror", rot: 0 }));

  return { width, height, cells, tray };
}

/** Fitness rewards a real, discoverable, non-trivial solution. */
function score(analysis: Analysis, g: Genome, targetComplexity: number): number {
  if (!analysis.solvable) return -1;
  if (analysis.minMoves === 0) return -1; // already solved on load
  const depth = Math.min(6, analysis.minMoves) * 12;
  const nearness = 100 - Math.abs(g.complexity - targetComplexity);
  const elegance = analysis.solutionCount <= 3 ? 22 : Math.max(0, 22 - analysis.solutionCount);
  return Math.round(depth * 0.5 + nearness * 0.5 + elegance + g.beamInteractions * 0.8);
}

/**
 * Grows a population, keeps only the puzzles that survive validation and
 * returns them best-first. Same seed ⇒ same puzzles, every time.
 */
export function evolvePuzzles({
  seed = 1,
  population = 24,
  width = 7,
  height = 7,
  targetComplexity = 55,
}: EvolveOptions = {}): { kept: Candidate[]; tested: number; rejected: number } {
  const rand = rng(seed);
  const kept: Candidate[] = [];
  let rejected = 0;

  for (let i = 0; i < population; i++) {
    const generation = 1 + Math.floor(i / 8);
    const board = grow(rand, width, height, generation);
    const analysis = analyse(board);
    if (!analysis.solvable || analysis.issues.length || analysis.minMoves === 0) {
      rejected++;
      continue;
    }
    const g = genome(board, analysis.minMoves);
    const fitness = score(analysis, g, targetComplexity);
    if (fitness < 0) {
      rejected++;
      continue;
    }
    kept.push({ board, analysis, genome: g, fitness, generation });
  }

  kept.sort((a, b) => b.fitness - a.fitness);
  return { kept: kept.slice(0, 6), tested: population, rejected };
}
