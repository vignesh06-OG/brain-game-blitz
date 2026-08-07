import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  Lightbulb,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PrismBoard } from "@/components/game/PrismBoard";
import { colorGlyph, colorName } from "@/game/engine";
import { getLevel, nextLevel } from "@/game/levels";
import { loadPrefs, recordSolve, savePrefs } from "@/game/progress";
import { useGame } from "@/game/useGame";
import type { Piece } from "@/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$levelId")({
  head: ({ params }) => {
    const level = getLevel(params.levelId);
    const title = level ? `${level.name} — Prism` : "Puzzle — Prism";
    const description = level
      ? `Chapter ${level.chapter}, puzzle ${level.index}. Route the beams and light every target in ${level.par} moves.`
      : "Route beams of light through mirrors, splitters and prisms.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PlayLevel,
});

const trayLabel = (piece: Piece) => {
  switch (piece.kind) {
    case "mirror":
      return "Mirror";
    case "splitter":
      return "Splitter";
    case "prism":
      return "Prism";
    case "filter":
      return `${colorName(piece.color ?? 7)} filter`;
    default:
      return piece.kind;
  }
};

function PlayLevel() {
  const { levelId } = Route.useParams();
  const level = getLevel(levelId);
  if (!level) return <MissingLevel />;
  return <LevelScreen key={level.id} levelId={level.id} />;
}

function MissingLevel() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">That puzzle doesn't exist</h1>
        <Link to="/play" className="mt-4 inline-block text-primary underline">
          Back to the puzzle list
        </Link>
      </div>
    </main>
  );
}

function LevelScreen({ levelId }: { levelId: string }) {
  const level = getLevel(levelId)!;
  const navigate = useNavigate();
  const game = useGame(level);
  const [hintLevel, setHintLevel] = useState(0);
  const [prefs, setPrefs] = useState(() => ({ colorblind: false, reduceMotion: false }));
  const [showTeach, setShowTeach] = useState(!!level.teaches);
  const [celebrated, setCelebrated] = useState(false);
  const next = nextLevel(levelId);

  useEffect(() => setPrefs(loadPrefs()), []);

  useEffect(() => {
    if (game.result.solved && !celebrated) {
      setCelebrated(true);
      recordSolve(level.id, game.moves);
    }
  }, [game.result.solved, game.moves, level.id, celebrated]);

  const togglePref = (k: "colorblind" | "reduceMotion") => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <main
      className={cn("min-h-dvh aurora px-4 py-6 sm:px-6", prefs.reduceMotion && "reduce-motion")}
    >
      <div className="mx-auto max-w-5xl">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/play"
              aria-label="Back to puzzle list"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface/70 transition-colors hover:bg-surface-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Chapter {level.chapter} · {level.index}
              </p>
              <h1 className="truncate text-xl font-extrabold sm:text-2xl">{level.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full border border-border bg-surface/70 px-3 py-1.5 tabular-nums">
              {game.moves} / par {level.par}
            </span>
            <span className="rounded-full border border-border bg-surface/70 px-3 py-1.5 tabular-nums">
              {game.result.solvedCount}/{game.result.targetCount} lit
            </span>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <PrismBoard
              board={game.board}
              result={game.result}
              onActivate={game.activate}
              colorblind={prefs.colorblind}
              placing={!!game.selectedTrayId}
            />

            {game.board.tray.length > 0 && (
              <div className="mt-4 rounded-2xl border border-border bg-surface/60 p-3 backdrop-blur">
                <p className="mb-2 text-xs tracking-widest text-muted-foreground uppercase">
                  Tray — pick a piece, then tap a cell
                </p>
                <ul className="flex flex-wrap gap-2">
                  {game.board.tray.map((piece) => (
                    <li key={piece.id}>
                      <button
                        type="button"
                        onClick={() =>
                          game.setSelectedTrayId(
                            game.selectedTrayId === piece.id ? null : piece.id,
                          )
                        }
                        aria-pressed={game.selectedTrayId === piece.id}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
                          game.selectedTrayId === piece.id
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-surface-2 hover:border-primary/50",
                        )}
                      >
                        <span aria-hidden="true">{colorGlyph(piece.color ?? 7)}</span>
                        {trayLabel(piece)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={game.undo}
                disabled={!game.canUndo}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm transition-colors hover:bg-surface-2 disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" /> Undo
              </button>
              <button
                type="button"
                onClick={() => {
                  game.reset();
                  setHintLevel(0);
                  setCelebrated(false);
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm transition-colors hover:bg-surface-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => setHintLevel((h) => Math.min(h + 1, 2))}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent/20"
            >
              <Lightbulb className="h-4 w-4 text-accent" aria-hidden="true" />
              {hintLevel === 0 ? "Stuck? Get a nudge" : "Tell me more"}
            </button>

            {hintLevel > 0 && (
              <div
                className="rounded-2xl border border-accent/30 bg-surface/70 p-4 text-sm backdrop-blur"
                aria-live="polite"
              >
                <p className="font-display text-xs tracking-widest text-accent uppercase">
                  Tutor
                </p>
                <p className="mt-2 text-muted-foreground">
                  {hintLevel === 1
                    ? "Read the targets first — each glyph tells you the exact colour it needs."
                    : level.hint}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => togglePref("colorblind")}
              aria-pressed={prefs.colorblind}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-4 text-sm transition-colors hover:bg-surface-2"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Colourblind labels {prefs.colorblind ? "on" : "off"}
            </button>
            <button
              type="button"
              onClick={() => togglePref("reduceMotion")}
              aria-pressed={prefs.reduceMotion}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-surface/70 px-4 text-sm transition-colors hover:bg-surface-2"
            >
              Reduced motion {prefs.reduceMotion ? "on" : "off"}
            </button>
          </aside>
        </div>
      </div>

      {showTeach && level.teaches && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-6">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary/40 bg-surface p-4 shadow-lg backdrop-blur">
            <p className="min-w-0 flex-1 text-sm">{level.teaches}</p>
            <button
              type="button"
              onClick={() => setShowTeach(false)}
              className="min-h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {game.result.solved && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-background/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-primary/40 bg-surface p-8 text-center" style={{ boxShadow: "var(--shadow-glow)" }}>
            <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">
              Solved
            </p>
            <h2 className="mt-3 text-3xl font-extrabold">{level.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {game.moves} moves · par {level.par}
              {game.moves <= level.par ? " · perfect route" : ""}
            </p>
            <div className="mt-7 flex flex-col gap-2">
              {next ? (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/play/$levelId", params: { levelId: next.id } })}
                  className="min-h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Next puzzle: {next.name}
                </button>
              ) : (
                <Link
                  to="/play"
                  className="min-h-11 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                  You finished every puzzle
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  game.reset();
                  setCelebrated(false);
                }}
                className="min-h-11 rounded-full border border-border px-6 text-sm transition-colors hover:bg-surface-2"
              >
                Replay for a better route
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
