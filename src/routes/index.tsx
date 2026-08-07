import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkle } from "lucide-react";
import { CHAPTERS, LEVELS } from "@/game/levels";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prism — A Puzzle Game Made of Light" },
      {
        name: "description",
        content:
          "Bend, split and mix beams of light to solve 12 hand-built logic puzzles. Prism is a colour-mixing puzzle game with an adaptive hint tutor.",
      },
      { property: "og:title", content: "Prism — A Puzzle Game Made of Light" },
      {
        property: "og:description",
        content:
          "Bend, split and mix beams of light to solve hand-built logic puzzles. Colour is the mechanic.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const beams = [
    { c: "var(--beam-red)", d: "M -100 120 L 1600 420" },
    { c: "var(--beam-cyan)", d: "M -100 320 L 1600 60" },
    { c: "var(--beam-magenta)", d: "M -100 520 L 1600 260" },
  ];

  return (
    <main className="relative min-h-dvh overflow-hidden aurora">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {beams.map((b, i) => (
          <g key={i}>
            <path d={b.d} stroke={b.c} strokeWidth={14} fill="none" filter="url(#heroGlow)" opacity={0.5} />
            <path d={b.d} stroke={b.c} strokeWidth={2} fill="none" opacity={0.9} />
          </g>
        ))}
      </svg>

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-20">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase backdrop-blur">
          <Sparkle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Puzzle Masters Hackathon 2026
        </p>

        <h1 className="mt-8 text-6xl leading-[0.95] font-extrabold sm:text-8xl">
          Light is the
          <br />
          <span className="text-primary text-glow">only</span> mechanic.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Prism is a logic puzzle about routing beams. Turn mirrors, split rays, strip
          colour with filters and shatter white light through a prism until every target
          burns the exact shade it asks for.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/play"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Start playing
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/play/$levelId"
            params={{ levelId: LEVELS[LEVELS.length - 1]!.id }}
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface/60 px-6 text-sm font-medium backdrop-blur transition-colors hover:bg-surface-2"
          >
            Jump to the hardest one
          </Link>
        </div>

        <ul className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHAPTERS.map((c) => (
            <li
              key={c.n}
              className="rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur"
            >
              <p className="font-display text-sm text-primary">Chapter {c.n}</p>
              <p className="mt-1 font-display text-lg font-bold">{c.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
