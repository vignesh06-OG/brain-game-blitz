import { useCallback, useMemo, useState } from "react";
import { cloneBoard, trace } from "./engine";
import type { Board, Level, Piece } from "./types";
import { key } from "./types";

export interface GameState {
  board: Board;
  moves: number;
  result: ReturnType<typeof trace>;
  selectedTrayId: string | null;
  setSelectedTrayId: (id: string | null) => void;
  activate: (x: number, y: number) => void;
  pickUp: (x: number, y: number) => void;
  reset: () => void;
  undo: () => void;
  canUndo: boolean;
}

const ROTATABLE = new Set(["mirror", "splitter"]);

export function useGame(level: Level): GameState {
  const [board, setBoard] = useState<Board>(() => cloneBoard(level.board));
  const [history, setHistory] = useState<Board[]>([]);
  const [moves, setMoves] = useState(0);
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null);

  const result = useMemo(() => trace(board), [board]);

  const commit = useCallback((next: Board) => {
    setBoard((prev) => {
      setHistory((h) => [...h.slice(-40), prev]);
      return next;
    });
    setMoves((m) => m + 1);
  }, []);

  const activate = useCallback(
    (x: number, y: number) => {
      const k = key(x, y);
      const piece: Piece | undefined = board.cells[k];
      const next = cloneBoard(board);

      if (!piece) {
        if (!selectedTrayId) return;
        const idx = next.tray.findIndex((t) => t.id === selectedTrayId);
        if (idx === -1) return;
        const [taken] = next.tray.splice(idx, 1);
        next.cells[k] = taken!;
        setSelectedTrayId(null);
        commit(next);
        return;
      }

      if (piece.fixed) return;

      if (ROTATABLE.has(piece.kind)) {
        next.cells[k] = { ...piece, rot: (piece.rot + 1) % 2 };
        commit(next);
        return;
      }

      // Non-rotatable placed piece: return it to the tray.
      delete next.cells[k];
      next.tray.push(piece);
      commit(next);
    },
    [board, commit, selectedTrayId],
  );

  const pickUp = useCallback(
    (x: number, y: number) => {
      const k = key(x, y);
      const piece = board.cells[k];
      if (!piece || piece.fixed) return;
      const next = cloneBoard(board);
      delete next.cells[k];
      next.tray.push(piece);
      commit(next);
    },
    [board, commit],
  );

  const reset = useCallback(() => {
    setBoard(cloneBoard(level.board));
    setHistory([]);
    setMoves(0);
    setSelectedTrayId(null);
  }, [level]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1]!;
      setBoard(prev);
      setMoves((m) => Math.max(0, m - 1));
      return h.slice(0, -1);
    });
  }, []);

  return {
    board,
    moves,
    result,
    selectedTrayId,
    setSelectedTrayId,
    activate,
    pickUp,
    reset,
    undo,
    canUndo: history.length > 0,
  };
}
