import { motion } from "motion/react";
import { BrainCircuit, EyeOff } from "lucide-react";
import type { Decision } from "@/game/photonmind/director";
import { cn } from "@/lib/utils";

interface Props {
  decision: Decision;
  onRequestSolution?: () => void;
  reduceMotion?: boolean;
  className?: string;
}

const STATE_TONE: Record<Decision["state"], string> = {
  FLOWING: "text-beam-green",
  EXPLORING: "text-beam-cyan",
  UNCERTAIN: "text-accent",
  STRUGGLING: "text-accent",
  STUCK: "text-beam-red",
};

/**
 * The face of the Game Director. It always shows the same three things —
 * the state it read, the rung it chose, and the evidence behind that choice —
 * whether it decided to speak or to stay quiet.
 */
export function DirectorPanel({
  decision,
  onRequestSolution,
  reduceMotion = false,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-surface/70 p-4 text-sm backdrop-blur transition-colors",
        decision.silent ? "border-border" : "border-primary/40",
        className,
      )}
      aria-live="polite"
      aria-label="PhotonMind director"
    >
      <header className="flex items-center justify-between gap-2">
        <p className="font-display text-[11px] tracking-[0.28em] text-primary uppercase">
          PhotonMind
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-display text-[10px] tracking-[0.18em] uppercase",
              STATE_TONE[decision.state],
            )}
          >
            {decision.state}
          </span>
          {decision.silent ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <BrainCircuit className="h-4 w-4 text-primary" aria-hidden="true" />
          )}
        </div>
      </header>

      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-display text-[10px] tracking-widest text-muted-foreground uppercase">
          Rung {decision.rung} · {decision.rungLabel}
        </span>
      </div>

      <motion.p
        key={decision.headline}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        className="mt-2 font-display font-bold"
      >
        {decision.headline}
      </motion.p>
      <p className="mt-1.5 text-xs text-muted-foreground">{decision.body}</p>

      <div className="mt-3">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">
          Why this decision
        </p>
        <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
          {decision.evidence.slice(0, 4).map((e, i) => (
            <motion.li
              key={e}
              initial={reduceMotion ? false : { opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.05 }}
              className="border-l border-primary/30 pl-2.5"
            >
              {e}
            </motion.li>
          ))}
        </ul>
      </div>

      {decision.rung >= 3 && decision.rung < 5 && onRequestSolution ? (
        <button
          type="button"
          onClick={onRequestSolution}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-surface/70 px-4 text-xs transition-colors hover:bg-surface-2"
        >
          I want the solver's route
        </button>
      ) : null}

      <p className="mt-3 text-[10px] text-muted-foreground/70">
        Behaviour read on-device. The deterministic solver, not the model, is the source of truth.
      </p>
    </section>
  );
}
