import { memo } from "react";
import { colorGlyph, colorName, colorVar } from "@/game/engine";
import type { Board, ColorMask, Piece, TraceResult } from "@/game/types";
import { key } from "@/game/types";
import { cn } from "@/lib/utils";

const C = 100; // cell size in SVG units
const center = (n: number) => n * C + C / 2;

interface Props {
  board: Board;
  result: TraceResult;
  onActivate: (x: number, y: number) => void;
  colorblind: boolean;
  placing: boolean;
  hintCell?: string | null;
}

function PieceShape({ piece, satisfied }: { piece: Piece; satisfied: boolean }) {
  const color = colorVar(piece.color ?? 7);
  switch (piece.kind) {
    case "emitter":
      return (
        <g>
          <rect
            x={-34}
            y={-34}
            width={68}
            height={68}
            rx={16}
            fill="var(--surface-2)"
            stroke={color}
            strokeWidth={3}
          />
          <circle cx={0} cy={0} r={13} fill={color} filter="url(#glow)" />
          <g transform={`rotate(${piece.rot * 90})`}>
            <path d="M 0 -14 L 8 -30 L -8 -30 Z" fill={color} />
          </g>
        </g>
      );
    case "target":
      return (
        <g>
          <circle
            cx={0}
            cy={0}
            r={32}
            fill={satisfied ? color : "transparent"}
            fillOpacity={satisfied ? 0.22 : 0}
            stroke={color}
            strokeWidth={satisfied ? 5 : 3}
            strokeDasharray={satisfied ? undefined : "10 8"}
            filter={satisfied ? "url(#glow)" : undefined}
          />
          <text
            x={0}
            y={9}
            textAnchor="middle"
            fontSize={26}
            fill={color}
            opacity={satisfied ? 1 : 0.65}
          >
            {colorGlyph(piece.color ?? 7)}
          </text>
          {satisfied && (
            <circle
              cx={0}
              cy={0}
              r={32}
              fill="none"
              stroke={color}
              strokeWidth={2}
              className="animate-pulse-ring"
              style={{ transformOrigin: "center" }}
            />
          )}
        </g>
      );
    case "mirror":
      return (
        <g transform={`rotate(${piece.rot % 2 === 0 ? -45 : 45})`}>
          <rect
            x={-38}
            y={-6}
            width={76}
            height={12}
            rx={6}
            fill="var(--beam-white)"
            opacity={0.92}
            filter="url(#glow)"
          />
          <rect x={-38} y={2} width={76} height={4} rx={2} fill="var(--surface-2)" />
        </g>
      );
    case "splitter":
      return (
        <g transform={`rotate(${piece.rot % 2 === 0 ? -45 : 45})`}>
          <rect
            x={-38}
            y={-6}
            width={76}
            height={12}
            rx={6}
            fill="var(--beam-cyan)"
            opacity={0.55}
          />
          <rect
            x={-38}
            y={-6}
            width={76}
            height={12}
            rx={6}
            fill="none"
            stroke="var(--beam-cyan)"
            strokeWidth={2}
            strokeDasharray="8 7"
          />
        </g>
      );
    case "filter":
      return (
        <g>
          <circle cx={0} cy={0} r={30} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={3} />
          <text x={0} y={10} textAnchor="middle" fontSize={26} fill={color}>
            {colorGlyph(piece.color ?? 7)}
          </text>
        </g>
      );
    case "prism":
      return (
        <g>
          <path
            d="M 0 -36 L 34 26 L -34 26 Z"
            fill="var(--beam-white)"
            fillOpacity={0.14}
            stroke="var(--beam-white)"
            strokeWidth={3}
            filter="url(#glow)"
          />
        </g>
      );
    case "wall":
      return (
        <rect
          x={-40}
          y={-40}
          width={80}
          height={80}
          rx={12}
          fill="var(--surface-2)"
          stroke="var(--border)"
          strokeWidth={2}
        />
      );
    default:
      return null;
  }
}

function describe(piece: Piece | undefined, satisfied: boolean): string {
  if (!piece) return "Empty cell";
  switch (piece.kind) {
    case "emitter":
      return `${colorName(piece.color ?? 7)} emitter`;
    case "target":
      return `${colorName(piece.color ?? 7)} target, ${satisfied ? "lit" : "unlit"}`;
    case "mirror":
      return `Mirror facing ${piece.rot % 2 === 0 ? "north-east" : "north-west"}`;
    case "splitter":
      return `Splitter facing ${piece.rot % 2 === 0 ? "north-east" : "north-west"}`;
    case "filter":
      return `${colorName(piece.color ?? 7)} filter`;
    case "prism":
      return "Prism";
    case "wall":
      return "Wall";
  }
}

export const PrismBoard = memo(function PrismBoard({
  board,
  result,
  onActivate,
  colorblind,
  placing,
  hintCell,
}: Props) {
  const w = board.width * C;
  const h = board.height * C;

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: `${board.width} / ${board.height}` }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="grid" width={C} height={C} patternUnits="userSpaceOnUse">
            <path
              d={`M ${C} 0 L 0 0 0 ${C}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>

        <rect width={w} height={h} rx={20} fill="var(--surface)" />
        <rect width={w} height={h} rx={20} fill="url(#grid)" />

        {/* Beams: soft halo, solid core, travelling highlight */}
        <g strokeLinecap="round">
          {result.segments.map((s, i) => {
            const stroke = colorVar(s.color as ColorMask);
            const x1 = center(s.x1);
            const y1 = center(s.y1);
            const x2 = center(s.x2);
            const y2 = center(s.y2);
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={22}
                  opacity={0.18}
                  filter="url(#glow)"
                />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={7} />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--beam-white)"
                  strokeWidth={2.5}
                  opacity={0.75}
                  strokeDasharray="26 60"
                  style={{ animation: "beam-dash 1.6s linear infinite" }}
                />
              </g>
            );
          })}
        </g>

        {/* Pieces */}
        {Object.entries(board.cells).map(([k, piece]) => {
          const parts = k.split(",");
          const x = Number(parts[0]);
          const y = Number(parts[1]);
          const satisfied =
            piece.kind === "target" && (result.hits[k] ?? 0) === (piece.color ?? 7);
          return (
            <g key={piece.id} transform={`translate(${center(x)} ${center(y)})`}>
              <PieceShape piece={piece} satisfied={satisfied} />
            </g>
          );
        })}
      </svg>

      {/* Accessible interaction layer */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${board.width}, 1fr)`,
          gridTemplateRows: `repeat(${board.height}, 1fr)`,
        }}
      >
        {Array.from({ length: board.width * board.height }, (_, i) => {
          const x = i % board.width;
          const y = Math.floor(i / board.width);
          const k = key(x, y);
          const piece = board.cells[k];
          const satisfied =
            !!piece &&
            piece.kind === "target" &&
            (result.hits[k] ?? 0) === (piece.color ?? 7);
          const interactive = (!piece && placing) || (!!piece && !piece.fixed);
          return (
            <button
              key={k}
              type="button"
              onClick={() => onActivate(x, y)}
              disabled={!interactive}
              aria-label={`Column ${x + 1}, row ${y + 1}: ${describe(piece, satisfied)}`}
              className={cn(
                "m-[6%] rounded-xl transition-all duration-200",
                interactive
                  ? "cursor-pointer hover:bg-foreground/10 hover:scale-[1.04] active:scale-95"
                  : "cursor-default",
                !piece && placing && "bg-primary/5 ring-1 ring-primary/25",
                hintCell === k && "ring-2 ring-accent animate-pulse-ring",
              )}
            >
              {colorblind && piece?.kind === "target" && (
                <span className="sr-only">{colorName(piece.color ?? 7)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
