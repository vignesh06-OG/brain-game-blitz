import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { CHAPTERS, LEVELS } from "@/game/levels";
import { loadProgress } from "@/game/progress";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Choose a Puzzle — Prism" },
      {
        name: "description",
        content:
          "Twelve hand-built light puzzles across four chapters: Reflection, Refraction, Chromatics and Cathedral.",
      },
      { property: "og:title", content: "Choose a Puzzle — Prism" },
      {
        property: "og:description",
        content: "Twelve hand-built light puzzles across four chapters.",
      },
    ],
  }),
  component: LevelSelect,
});

function LevelSelect() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  useEffect(() => setProgress(loadProgress()), []);

  return (
    <main className="min-h-dvh aurora px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Puzzles</h1>
        <p className="mt-2 text-muted-foreground">
          Solved {Object.keys(progress).length} of {LEVELS.length}
        </p>

        <div className="mt-10 space-y-10">
          {CHAPTERS.map((chapter) => (
            <section key={chapter.n}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-bold">
                    {chapter.n}. {chapter.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{chapter.blurb}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {LEVELS.filter((l) => l.chapter === chapter.n).map((level) => {
                  const best = progress[level.id];
                  return (
                    <li key={level.id}>
                      <Link
                        to="/play/$levelId"
                        params={{ levelId: level.id }}
                        className="group block rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-semibold">{level.name}</span>
                          {best !== undefined ? (
                            <Check className="h-4 w-4 shrink-0 text-primary" aria-label="Solved" />
                          ) : (
                            <Lock
                              className="h-4 w-4 shrink-0 text-muted-foreground opacity-40"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Par {level.par}
                          {best !== undefined ? ` · your best ${best}` : ""}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
