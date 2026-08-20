import { motion } from "motion/react";
import { readLaws } from "@/game/lightlaws";
import { cn } from "@/lib/utils";

interface Props {
  discovered: string[];
  reduceMotion?: boolean;
  className?: string;
}

/**
 * The Living Rulebook, compressed to a rail. Each numeral is a law the player
 * has *caused the simulation to demonstrate* — unknown laws stay unnamed, so
 * the rail reads as territory left to discover rather than a checklist.
 */
export function LawsRail({ discovered, reduceMotion = false, className }: Props) {
  const laws = readLaws(discovered);
  const known = laws.filter((l) => l.known).length;

  return (
    <section
      className={cn("rounded-2xl border border-border bg-surface/50 p-3 backdrop-blur", className)}
      aria-label="Light Laws discovered"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
          Light Laws
        </p>
        <p className="font-display text-[10px] tabular-nums text-muted-foreground">
          {known}/{laws.length}
        </p>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {laws.map((law) => (
          <motion.li
            key={law.id}
            initial={reduceMotion ? false : { scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            title={law.known ? `${law.name} — ${law.statement}` : "Not yet discovered"}
            className={cn(
              "rounded-lg border px-2 py-1 font-display text-[10px] tracking-widest uppercase",
              law.known
                ? "border-primary/50 bg-primary/12 text-foreground"
                : "border-border/60 bg-surface-2/50 text-muted-foreground/50",
            )}
          >
            <span aria-hidden="true">{law.numeral}</span>
            <span className="sr-only">
              {law.known ? `${law.name}: ${law.statement}` : `Law ${law.numeral} undiscovered`}
            </span>
            {law.known ? <span className="ml-1.5 normal-case tracking-normal">{law.name}</span> : null}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
