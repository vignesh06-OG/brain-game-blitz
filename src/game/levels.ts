import { GENERATED, GENERATED_FACTS } from "./levels.generated";
import { BLUE, GREEN, RED, WHITE, key, type Board, type Level, type Piece } from "./types";

let uid = 0;
const p = (piece: Omit<Piece, "id">): Piece => ({ id: `p${++uid}`, ...piece });

const emitter = (rot: number, color = WHITE) =>
  p({ kind: "emitter", rot, color, fixed: true });
const target = (color = WHITE) => p({ kind: "target", rot: 0, color, fixed: true });
const mirror = (rot: number) => p({ kind: "mirror", rot });
const splitter = (rot: number) => p({ kind: "splitter", rot });
const filter = (color: number) => p({ kind: "filter", rot: 0, color });
const prism = () => p({ kind: "prism", rot: 0 });
const wall = () => p({ kind: "wall", rot: 0, fixed: true });

interface Spec {
  width: number;
  height: number;
  cells: Array<[number, number, Piece]>;
  tray?: Piece[];
}

const board = (spec: Spec): Board => ({
  width: spec.width,
  height: spec.height,
  cells: Object.fromEntries(spec.cells.map(([x, y, piece]) => [key(x, y), piece])),
  tray: spec.tray ?? [],
});

/**
 * The campaign is a designed difficulty curve, not a pile of puzzles.
 *
 *   1-1 … 1-3   Discovery      — "I understand how Prism works."
 *   2-1 … 2-3   Transformation — "I know the rules, now I have to think."
 *   3-1 … 3-3   Systems        — "I must plan the whole network first."
 *   4-1 … 4-2   Mastery        — "This is genuinely difficult."
 *   4-3         Culmination    — "I finally mastered the system."
 *
 * Every level carries a distinct cognitive identity (`concept`) so difficulty
 * grows through reasoning, never through board size or filler pieces. Pars are
 * the BFS optimum, verified by scripts/validate-levels.ts.
 */
const CORE: Level[] = [
  {
    id: "1-1",
    chapter: 1,
    index: 1,
    name: "Angle of Incidence",
    concept: "Reflection",
    tier: "Gentle",
    teaches: "Tap a mirror to turn it. Light bends where the mirror faces.",
    hint: "The mirror only has two positions. Try the other one.",
    par: 1,
    board: board({
      width: 5,
      height: 5,
      cells: [
        [0, 2, emitter(1)],
        [2, 2, mirror(1)],
        [2, 0, target()],
      ],
    }),
  },
  {
    id: "1-2",
    chapter: 1,
    index: 2,
    name: "The Law of Reflection",
    concept: "Chaining two reflections",
    tier: "Gentle",
    teaches: "A beam can be handed from one mirror to the next.",
    hint: "Send the beam down the far edge first, then back along the bottom.",
    par: 2,
    board: board({
      width: 6,
      height: 6,
      cells: [
        [0, 0, emitter(1)],
        [4, 0, mirror(0)],
        [4, 4, mirror(1)],
        [0, 4, target()],
        [2, 2, wall()],
        [3, 3, wall()],
      ],
    }),
  },
  {
    id: "1-3",
    chapter: 1,
    index: 3,
    name: "The Mirror That Was Right",
    concept: "Reading the existing path — restraint",
    tier: "Gentle",
    teaches: "Not every mirror is wrong. Read the path before you touch it.",
    hint: "One of the three mirrors is already aimed correctly. Find it, then leave it alone.",
    par: 2,
    board: board({
      width: 7,
      height: 5,
      cells: [
        [0, 0, emitter(1)],
        [5, 0, mirror(1)],
        [5, 3, mirror(1)],
        [1, 3, mirror(0)],
        [1, 1, target()],
        [3, 2, wall()],
      ],
    }),
  },
  {
    id: "2-1",
    chapter: 2,
    index: 1,
    name: "Partial Transmission",
    concept: "One beam, two destinations",
    tier: "Testing",
    teaches: "A splitter lets light pass through and bounce at the same time.",
    hint: "The splitter feeds both halves of the room — then the upper beam still needs turning.",
    par: 2,
    board: board({
      width: 7,
      height: 5,
      cells: [
        [0, 2, emitter(1)],
        [3, 2, splitter(1)],
        [6, 2, target()],
        [3, 0, mirror(1)],
        [6, 0, target()],
      ],
    }),
  },
  {
    id: "2-2",
    chapter: 2,
    index: 2,
    name: "Selective Absorption",
    concept: "Choosing what to remove from white",
    tier: "Testing",
    teaches: "Filters keep only their own colour. Drag one from the tray onto the grid.",
    hint: "Each target wants a pure colour — and the lower beam has to be turned before it can reach one.",
    par: 3,
    board: board({
      width: 7,
      height: 6,
      cells: [
        [0, 1, emitter(1)],
        [3, 1, splitter(1)],
        [6, 1, target(RED)],
        [3, 5, mirror(0)],
        [6, 5, target(GREEN)],
      ],
      tray: [filter(RED), filter(GREEN)],
    }),
  },
  {
    id: "2-3",
    chapter: 2,
    index: 3,
    name: "Dispersion",
    concept: "Placing the transformation, then routing its output",
    tier: "Testing",
    teaches: "A prism shatters white light: red runs straight, green peels up, blue peels down.",
    hint: "Place the prism so all three components have a clear run — then look at where blue lands.",
    par: 2,
    board: board({
      width: 7,
      height: 7,
      cells: [
        [0, 3, emitter(1)],
        [6, 3, target(RED)],
        [3, 0, target(GREEN)],
        [3, 6, mirror(0)],
        [6, 6, target(BLUE)],
      ],
      tray: [prism()],
    }),
  },
  {
    id: "3-1",
    chapter: 3,
    index: 1,
    name: "Additive Superposition",
    concept: "One beam owing two debts",
    tier: "Demanding",
    teaches:
      "Beams that arrive together add. Red plus green plus blue is white again — and one beam can serve two targets at once.",
    hint: "White needs all three channels. But red is also the only source the second target can ever use, so it has to do both jobs.",
    par: 3,
    board: board({
      width: 7,
      height: 7,
      cells: [
        [0, 3, emitter(1, RED)],
        [0, 0, emitter(1, GREEN)],
        [0, 6, emitter(1, BLUE)],
        [3, 3, splitter(0)],
        [3, 5, target(RED)],
        [6, 0, mirror(0)],
        [6, 6, mirror(1)],
        [6, 3, target(WHITE)],
      ],
    }),

  },
  {
    id: "3-2",
    chapter: 3,
    index: 2,
    name: "Cyanotype",
    concept: "Split, transform each half, recombine",
    tier: "Demanding",
    hint: "The target cannot be reached by one beam. Ask what two beams would have to carry.",
    par: 3,
    board: board({
      width: 8,
      height: 7,
      cells: [
        [0, 1, emitter(1)],
        [2, 1, splitter(0)],
        [5, 1, filter(GREEN)],
        [7, 1, target(GREEN | BLUE)],
        [2, 3, filter(BLUE)],
        [2, 5, mirror(0)],
        [7, 5, mirror(1)],
        [4, 4, wall()],
      ],
    }),
  },
  {
    id: "3-3",
    chapter: 3,
    index: 3,
    name: "Spectral Order",
    concept: "Three dependent deliveries from one source",
    tier: "Demanding",
    hint: "The prism does the sorting; each component then needs its own carrier. Solve them one colour at a time.",
    par: 3,
    board: board({
      width: 9,
      height: 7,
      cells: [
        [0, 3, emitter(1)],
        [4, 3, prism()],
        [8, 3, target(RED)],
        [4, 0, mirror(1)],
        [8, 0, mirror(0)],
        [8, 1, target(GREEN)],
        [4, 6, mirror(1)],
        [0, 6, target(BLUE)],
        [6, 5, wall()],
      ],
    }),
  },
  {
    id: "4-1",
    chapter: 4,
    index: 1,
    name: "Total Internal Path",
    concept: "A four-stage route with no spare moves",
    tier: "Master",
    hint: "Walk the perimeter clockwise in your head before touching anything: right, bottom, left, then inward.",
    par: 4,
    board: board({
      width: 9,
      height: 8,
      cells: [
        [0, 0, emitter(1)],
        [7, 0, mirror(0)],
        [7, 6, mirror(1)],
        [1, 6, mirror(0)],
        [1, 1, mirror(1)],
        [5, 1, target(WHITE)],
        [4, 2, wall()],
        [5, 4, wall()],
        [3, 5, wall()],
      ],
    }),
  },
  {
    id: "4-2",
    chapter: 4,
    index: 2,
    name: "The Whole Spectrum",
    concept: "One dispersion feeding three independent chains",
    tier: "Master",
    hint: "Red is already free. Green and blue each need their own carrier, and blue needs two.",
    par: 4,
    board: board({
      width: 9,
      height: 9,
      cells: [
        [0, 4, emitter(1)],
        [3, 4, prism()],
        [7, 4, mirror(1)],
        [7, 2, target(RED)],
        [3, 1, mirror(1)],
        [8, 1, target(GREEN)],
        [3, 7, splitter(0)],
        [8, 7, mirror(0)],
        [8, 8, target(BLUE)],
        [5, 6, wall()],
        [6, 3, wall()],
      ],
    }),
  },
  {
    id: "4-3",
    chapter: 4,
    index: 3,
    name: "Chromatic Lock",
    concept: "Backward reasoning across two sources",
    tier: "Master",
    hint: "Start at the white lock and work backwards: white needs red, green and blue arriving together — and only one of them comes from the prism's straight line.",
    par: 5,
    board: board({
      width: 9,
      height: 9,
      cells: [
        [0, 4, emitter(1)],
        [3, 4, prism()],
        [7, 4, mirror(0)],
        [7, 6, target(RED)],
        [3, 1, mirror(1)],
        [8, 1, target(WHITE)],
        [3, 7, mirror(0)],
        [8, 7, mirror(1)],
        [0, 0, emitter(1, RED)],
        [8, 0, mirror(0)],
        [5, 2, wall()],
        [1, 6, wall()],
      ],
    }),
  },
  /**
   * THE MASTER TRIAL.
   *
   * Chapter 2 taught that a prism takes white light apart. Chapter 3 taught
   * that channels add where beams meet. Chapter 4 taught backward reasoning.
   * This trial asks the campaign's question in reverse: the lock needs white,
   * the prism has already destroyed white, and the only edge that reaches the
   * lock is a single corridor — so the three channels must be walking that
   * corridor *together*.
   *
   * The obvious strategy (aim a colour at the lock) fails for a stated reason:
   * a target must receive exactly its colour, and no single channel is white.
   * The discovery is that a splitter is reciprocal — two beams entering from
   * different sides leave on one shared path. The splitter already sitting at
   * 7,4 does this in plain sight; the tray splitter is the player's to find.
   *
   * Solver-verified: exactly one solution, 6 moves, no alternative placement.
   */
  {
    id: "5-1",
    chapter: 5,
    index: 1,
    name: "Reciprocity",
    concept: "Two beams, one edge",
    tier: "Master",
    master: true,
    hints: [
      "Read the lock first. It wants white — and white is the one colour the prism guarantees you will never have again.",
      "The lock only touches one edge of the board. Whatever reaches it has to be travelling along that single corridor at the same time.",
      "You have been told a splitter divides a beam. Look at it the other way round: it has two ways in as well as two ways out.",
    ],
    hint: "You have been told a splitter divides a beam. Look at it the other way round: it has two ways in as well as two ways out.",
    reveal: {
      principle: "Reciprocity — a splitter read backwards",
      casual:
        "A splitter doesn't only divide light. In Prism, send two beams into one from different sides and they leave together, along the same path.",
      curious:
        "Prism models splitting as a symmetric relationship: the element that turns one beam into two will also take two beams and carry them out as one. That is why a prism can pull white apart and splitters can put the channels back together again.",
      advanced:
        "Under the hood Prism is not a wave simulator. Beams are red/green/blue channel masks, an edge carries the bitwise union of every ray crossing it, and a target checks the mask arriving on its edge — so recombination is exact and deterministic by construction. Real optics does have a genuine reciprocity principle (reversing propagation swaps the transmitted and reflected roles of a beamsplitter, which is what lets interferometers use one element to divide and recombine), but real recombination depends on phase, coherence and polarisation, none of which Prism models. Treat this level as a faithful piece of optical *reasoning*, not a physically complete simulation.",
    },

    par: 6,
    board: board({
      width: 9,
      height: 9,
      cells: [
        [0, 4, emitter(1)],
        // Takes white apart: red straight on, green north, blue south.
        [2, 4, p({ kind: "prism", rot: 0, fixed: true })],
        // Keeps the main line honest — only red may travel east from here.
        [3, 4, p({ kind: "filter", rot: 0, color: RED, fixed: true })],
        [2, 1, mirror(1)],
        [4, 1, mirror(0)],
        // The green junction is empty. The tray piece belongs here.
        [4, 5, wall()],
        [2, 7, mirror(0)],
        [7, 7, mirror(1)],
        // Already aimed correctly: the affordance, shown and never explained.
        [7, 4, splitter(0)],
        [8, 4, target(WHITE)],
      ],
      tray: [splitter(0)],
    }),
  },
];

/**
 * CHAPTER EXPANSION.
 *
 * Boards live in levels.generated.ts — each one was constructed around a
 * guaranteed solution path and then re-verified by the exhaustive BFS solver,
 * so `par` and `solutions` below are read straight from the solver's own
 * measurements rather than estimated by hand.
 */
const ex = (
  id: string,
  meta: Omit<Level, "id" | "chapter" | "index" | "par" | "board" | "solutions">,
): Level => {
  const facts = GENERATED_FACTS[id]!;
  const [chapter, index] = id.split("-").map(Number) as [number, number];
  return {
    id,
    chapter,
    index,
    ...meta,
    par: facts.par,
    solutions: facts.solutions,
    board: GENERATED[id]!,
  };
};

const EXPANSION: Level[] = [
  // ---------- CHAPTER 1 · SEE ----------
  ex("1-4", {
    name: "The Long Way Round",
    concept: "Routing across a whole room",
    tier: "Gentle",
    hint: "Follow the beam from the emitter and stop at the first mirror that does nothing useful.",
  }),
  ex("1-5", {
    name: "Two Turns",
    concept: "Order of reflections",
    tier: "Gentle",
    hint: "Fix the mirror the light meets first. Everything after it moves with it.",
  }),
  ex("1-6", {
    name: "The Missing Mirror",
    concept: "Placing a surface, not just turning one",
    tier: "Gentle",
    teaches: "Some pieces start in the tray. Drag one onto any empty cell to place it.",
    hint: "The beam already runs past the row the target sits on. Give it a surface where those two lines cross.",
  }),
  ex("1-7", {
    name: "Three Bends",
    concept: "A chain long enough to plan",
    tier: "Gentle",
    hint: "Three mirrors, three decisions. Work forwards from the emitter, not backwards from the target.",
  }),
  ex("1-8", {
    name: "Bring Your Own Surface",
    concept: "Placing and aiming in the same plan",
    tier: "Testing",
    hint: "Decide where the tray mirror has to sit before you touch any mirror already on the bench.",
  }),

  // ---------- CHAPTER 2 · MIX ----------
  ex("2-4", {
    name: "Two Doors, Two Colours",
    concept: "One split, two coloured obligations",
    tier: "Testing",
    hint: "Each branch already has its filter. You only have to aim what comes out of it.",
  }),
  ex("2-5", {
    name: "White Undone",
    concept: "Reading a dispersion fan",
    tier: "Testing",
    hint: "Red carries straight on, green peels one way and blue the other. Name each one before you move.",
  }),
  ex("2-6", {
    name: "Half and Half",
    concept: "One beam serving two rooms",
    tier: "Testing",
    hint: "The splitter is already doing its job. The question is where each half lands.",
  }),
  ex("2-7", {
    name: "More Than One Way",
    concept: "A puzzle with several optimal answers",
    tier: "Testing",
    hint: "There is more than one correct route here. Commit to one and follow it through.",
  }),
  ex("2-8", {
    name: "Twice Filtered",
    concept: "Subtraction is one-way",
    tier: "Testing",
    hint: "A filter can only take away. If a channel is missing upstream, no later piece can bring it back.",
  }),
  ex("2-9", {
    name: "Three at Once",
    concept: "Three deliveries from one dispersion",
    tier: "Testing",
    hint: "Solve one colour completely, then the next. They do not interfere.",
  }),

  // ---------- CHAPTER 3 · REASON ----------
  ex("3-4", {
    name: "Choice of Routes",
    concept: "Equally valid plans",
    tier: "Demanding",
    hint: "Several placements work. Pick the one you can finish, not the one you saw first.",
  }),
  ex("3-5", {
    name: "Two Sources",
    concept: "Independent beams, shared board",
    tier: "Demanding",
    hint: "Two emitters, two obligations. Treat them as separate problems until they collide.",
  }),
  ex("3-6", {
    name: "Both Halves Matter",
    concept: "A split that cannot be half-solved",
    tier: "Demanding",
    hint: "Aiming the near target is easy. Check what that same move does to the far one.",
  }),
  ex("3-7",  {
    name: "Colour Obligations",
    concept: "Two channels, two destinations",
    tier: "Demanding",
    hint: "Work out which target can only ever be fed by one branch, and satisfy that one first.",
  }),
  ex("3-8", {
    name: "The Second Target",
    concept: "Path dependency between branches",
    tier: "Demanding",
    hint: "Every move you make on the shared stretch changes both branches at once.",
  }),
  ex("3-9", {
    name: "Independent Chains",
    concept: "Two long routes, no interference",
    tier: "Demanding",
    hint: "Neither beam can help the other. Four moves, split two and two.",
  }),

  // ---------- CHAPTER 4 · CONSTRAIN ----------
  ex("4-4", {
    name: "One Piece in Hand",
    concept: "A single placement decides everything",
    tier: "Demanding",
    hint: "There is exactly one cell where the tray piece is useful. Find it before rotating anything.",
  }),
  ex("4-5", {
    name: "Nothing to Spare",
    concept: "Par equals the number of decisions",
    tier: "Demanding",
    hint: "Every move in par is load-bearing. If a move changes nothing visible, it is the wrong move.",
  }),
  ex("4-6", {
    name: "Exact Change",
    concept: "Optimisation under a fixed budget",
    tier: "Demanding",
    hint: "Count the mirrors that are currently wrong. That count is your answer.",
  }),
  ex("4-7", {
    name: "No Wasted Move",
    concept: "Placement before rotation",
    tier: "Demanding",
    hint: "Place first, aim second. Aiming a mirror before you know the route wastes a move.",
  }),
  ex("4-8", {
    name: "Split Under Constraint",
    concept: "Two obligations, four moves",
    tier: "Master",
    hint: "Solve the branch with the fewest options first — it constrains the other one.",
  }),
  ex("4-9", {
    name: "Five Exactly",
    concept: "Minimum-move reasoning",
    tier: "Master",
    hint: "Five moves is the proven minimum. If your plan needs six, the plan is wrong, not the board.",
  }),

  // ---------- CHAPTER 5 · BREAK ----------
  ex("5-2", {
    name: "What the Filter Costs",
    concept: "The cheapest route is not always available",
    tier: "Master",
    hint: "The obvious line reaches the target with the wrong channel. Ask what that target can actually accept.",
  }),
  ex("5-3", {
    name: "The Colour You Cannot Make",
    concept: "Dispersion is destructive",
    tier: "Master",
    hint: "Once white is taken apart, no single branch is white again. Plan around what each branch really carries.",
  }),
  ex("5-4", {
    name: "Backwards Through the Spectrum",
    concept: "Reasoning from the target outwards",
    tier: "Master",
    hint: "Start at each target, decide which prism output could reach it, and only then aim mirrors.",
  }),
  ex("5-5", {
    name: "Two Beams, Two Debts",
    concept: "Sources that cannot cover for each other",
    tier: "Master",
    hint: "Neither emitter can reach both targets. Assign them before you move anything.",
  }),
  ex("5-6", {
    name: "The Useful Detour",
    concept: "A longer path that costs fewer moves",
    tier: "Master",
    hint: "The short route needs more re-aiming than the long one. Count moves, not distance.",
  }),

  // ---------- CHAPTER 6 · APPLY ----------
  ex("6-1", {
    name: "Stage Wash",
    concept: "Colour-mixing a lighting rig",
    tier: "Demanding",
    hint: "Theatre lanterns mix light, not paint. Each lamp needs the channel its gel will pass.",
  }),
  ex("6-2", {
    name: "Spectrometer Bench",
    concept: "Sorting a source into its lines",
    tier: "Demanding",
    hint: "A spectrometer separates first and measures second. Get the fan clear before you route it.",
  }),
  ex("6-3", {
    name: "Twin Beacons",
    concept: "Two installations, one bench",
    tier: "Demanding",
    hint: "Two lamps, two sightlines. Neither can borrow the other's light.",
  }),
  ex("6-4", {
    name: "Fibre Splice",
    concept: "Keeping channels separate down one run",
    tier: "Demanding",
    hint: "A splice must deliver each channel unmixed. Check what arrives, not just that something arrives.",
  }),
  ex("6-5", {
    name: "Survey Line",
    concept: "Sightlines around obstacles",
    tier: "Master",
    hint: "Surveyors route around what they cannot move. The walls decide the corridor for you.",
  }),
  ex("6-6", {
    name: "Interferometer Arm",
    concept: "One source, two arms of equal duty",
    tier: "Master",
    hint: "Both arms of the instrument have to be satisfied by the same divided beam.",
  }),

  // ---------- CHAPTER 7 · MASTER ----------
  ex("7-1", {
    name: "Full Dispersion",
    concept: "Three channels, five moves",
    tier: "Master",
    hint: "Red is usually already free. Spend your moves on the two that are not.",
  }),
  ex("7-2", {
    name: "Parallel Obligations",
    concept: "Two sources at full length",
    tier: "Master",
    hint: "Plan both routes on paper before the first tap. Half a plan costs moves.",
  }),
  ex("7-3", {
    name: "Long Division",
    concept: "A split with two long tails",
    tier: "Master",
    hint: "The shared stretch is the expensive part. Settle it first, then finish each tail.",
  }),
  ex("7-4", {
    name: "The Quiet Corner",
    concept: "The far target is the constraint",
    tier: "Master",
    hint: "One target is far harder to reach than the other. Build the whole route around it.",
  }),
  ex("7-5", {
    name: "Six Exactly",
    concept: "Dispersion at full depth",
    tier: "Master",
    hint: "Six moves, three colours. Assign each move to a colour before you start.",
  }),
  ex("7-6", {
    name: "Both Ends of the Bench",
    concept: "Two sources, six decisions",
    tier: "Master",
    hint: "Work from whichever emitter has fewer legal routes — it will pin down the rest.",
  }),
  ex("7-7", {
    name: "Seven Bends",
    concept: "A route too long to hold in your head",
    tier: "Master",
    hint: "Trace the whole path once, out loud, before touching anything. Seven moves punishes guessing.",
  }),
  ex("7-8", {
    name: "The Long Spectrum",
    concept: "Every idea in the campaign, at once",
    tier: "Master",
    hint: "Dispersion, three chains, eight moves. This is the campaign asking for all of it together.",
  }),
];

/** The shipping campaign: hand-built anchors plus the verified expansion. */
export const LEVELS: Level[] = [...CORE, ...EXPANSION].sort(
  (a, b) => a.chapter - b.chapter || a.index - b.index,
);

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id);
export const nextLevel = (id: string) => {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i >= 0 ? LEVELS[i + 1] : undefined;
};

/**
 * The campaign reads as a scientific journey rather than a list of stages:
 * each chapter is a phenomenon, each level the experiment that demonstrates it.
 */
export const CHAPTERS = [
  {
    n: 1,
    name: "Reflection",
    subtitle: "Discover light",
    blurb:
      "Light travels in straight lines until a surface turns it. Three experiments: bend one beam, chain two mirrors, and learn to read a path before you disturb it.",
  },
  {
    n: 2,
    name: "Refraction & Absorption",
    subtitle: "Understand light",
    blurb:
      "White light is a bundle of wavelengths. Splitters duplicate a beam, filters absorb what they are not, and prisms separate every component at once.",
  },
  {
    n: 3,
    name: "Superposition",
    subtitle: "Combine light",
    blurb:
      "Where beams meet, their channels add. From here a target is rarely reachable by a single beam — you have to design the whole network before the first move.",
  },
  {
    n: 4,
    name: "Optical Systems",
    subtitle: "Master light",
    blurb:
      "Long optical paths, several sources and no spare moves. The final lock has to be solved backwards, from the colour it demands to the light that can supply it.",
  },
  {
    n: 5,
    name: "The Master Trial",
    subtitle: "Question light",
    blurb:
      "One puzzle. Everything the campaign taught you about taking light apart, asked backwards.",
  },
];
