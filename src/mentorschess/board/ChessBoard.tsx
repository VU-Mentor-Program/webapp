import React, { useMemo, useRef, useState } from "react";
import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import { pieceCode, pieceImages, type PieceCode } from "./pieces";
import { PromotionPicker } from "./PromotionPicker";
import { boardTheme } from "../theme";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const DRAG_THRESHOLD_PX = 6;

export interface ChessBoardProps {
  fen: string;
  orientation: Color;
  interactive: boolean;
  /** Which side's pieces may be picked up. Defaults to the side to move. */
  movableColor?: Color | "both";
  legalMoves: (from: Square) => Move[];
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  lastMove?: { from: Square; to: Square } | null;
  checkSquare?: Square | null;
  highlightSquares?: Square[];
  shake?: boolean;
}

interface DragState {
  from: Square;
  piece: PieceCode;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

type PositionMap = Partial<Record<Square, { color: Color; type: PieceSymbol }>>;

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation,
  interactive,
  movableColor,
  legalMoves,
  onMove,
  lastMove,
  checkSquare,
  highlightSquares = [],
  shake = false,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  // Whether the piece under a fresh pointerdown was already selected, so a second tap toggles it off.
  const wasAlreadySelected = useRef(false);
  const [selected, setSelected] = useState<Square | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const { position, turn } = useMemo(() => {
    const map: PositionMap = {};
    let turn: Color = "w";
    try {
      const chess = new Chess(fen);
      turn = chess.turn();
      for (const row of chess.board()) {
        for (const cell of row) {
          if (cell) map[cell.square] = { color: cell.color, type: cell.type };
        }
      }
    } catch {
      // invalid FEN → empty board
    }
    return { position: map, turn };
  }, [fen]);

  const movable: Color | "both" = movableColor ?? turn;
  const canPick = (color: Color) => interactive && (movable === "both" ? color === turn : color === movable && color === turn);

  const targets = useMemo(() => {
    if (!selected) return new Map<Square, Move[]>();
    const map = new Map<Square, Move[]>();
    for (const m of legalMoves(selected)) {
      const list = map.get(m.to) ?? [];
      list.push(m);
      map.set(m.to, list);
    }
    return map;
  }, [selected, legalMoves]);

  const squares: Square[] = useMemo(() => {
    const ranks = orientation === "w" ? [...RANKS].reverse() : [...RANKS];
    const files = orientation === "w" ? [...FILES] : [...FILES].reverse();
    return ranks.flatMap((r) => files.map((f) => `${f}${r}` as Square));
  }, [orientation]);

  const squareFromPoint = (clientX: number, clientY: number): Square | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
    const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    return squares[row * 8 + col];
  };

  const attemptMove = (from: Square, to: Square) => {
    const candidates = legalMoves(from).filter((m) => m.to === to);
    if (candidates.length === 0) return false;
    setSelected(null);
    if (candidates.some((m) => m.promotion)) {
      setPendingPromotion({ from, to });
    } else {
      onMove(from, to);
    }
    return true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || pendingPromotion) return;
    const square = squareFromPoint(e.clientX, e.clientY);
    if (!square) return;

    if (selected && selected !== square && targets.has(square)) {
      attemptMove(selected, square);
      return;
    }

    const piece = position[square];
    if (piece && canPick(piece.color)) {
      setSelected(square);
      try {
        boardRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // pointer already released — tap-to-move still works without capture
      }
      setDrag({
        from: square,
        piece: pieceCode(piece.color, piece.type),
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        moved: false,
      });
      return;
    }

    setSelected(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD_PX;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const target = squareFromPoint(e.clientX, e.clientY);
    if (drag.moved && target && target !== drag.from) {
      attemptMove(drag.from, target);
    } else if (!drag.moved && selected === drag.from && e.type === "pointerup" && wasAlreadySelected.current) {
      // tapping the selected piece again deselects it
      setSelected(null);
    }
    wasAlreadySelected.current = false;
    setDrag(null);
  };

  const onPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const square = squareFromPoint(e.clientX, e.clientY);
    wasAlreadySelected.current = !!square && square === selected;
  };

  const squareSize = boardRef.current ? boardRef.current.getBoundingClientRect().width / 8 : 64;

  return (
    <div className={`relative select-none ${shake ? "chess-shake" : ""}`} style={{ width: "min(100%, 560px)" }}>
      <div
        ref={boardRef}
        className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl border border-white/10"
        style={{ aspectRatio: "1 / 1", touchAction: "none" }}
        onPointerDownCapture={onPointerDownCapture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {squares.map((sq, i) => {
          const file = sq[0];
          const rank = sq[1];
          const isLight = (FILES.indexOf(file as (typeof FILES)[number]) + Number(rank)) % 2 === 1;
          const piece = position[sq];
          const isSelected = selected === sq;
          const isLast = lastMove?.from === sq || lastMove?.to === sq;
          const isTarget = targets.has(sq);
          const isCapture = isTarget && !!piece;
          const isCheck = checkSquare === sq;
          const isHint = highlightSquares.includes(sq);
          const hideOrigin = drag?.moved && drag.from === sq;
          const showFile = i >= 56;
          const showRank = i % 8 === 0;

          // The piece that just arrived slides in from its origin square.
          let slideStyle: React.CSSProperties | undefined;
          if (lastMove && lastMove.to === sq) {
            const fromIndex = squares.indexOf(lastMove.from);
            if (fromIndex !== -1) {
              const dx = ((fromIndex % 8) - (i % 8)) * 100;
              const dy = (Math.floor(fromIndex / 8) - Math.floor(i / 8)) * 100;
              slideStyle = { "--dx": `${dx}%`, "--dy": `${dy}%` } as React.CSSProperties;
            }
          }

          return (
            <div
              key={sq}
              className="relative"
              style={{ backgroundColor: isLight ? boardTheme.light : boardTheme.dark }}
            >
              {isLast && <div className="absolute inset-0 bg-emerald-400/35" />}
              {isSelected && <div className="absolute inset-0 bg-emerald-300/50" />}
              {isHint && <div className="absolute inset-0 ring-4 ring-inset ring-amber-400 animate-pulse" />}
              {isCheck && (
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0.35) 55%, transparent 75%)" }}
                />
              )}
              {isTarget && !isCapture && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[30%] h-[30%] rounded-full bg-emerald-300/70" />
                </div>
              )}
              {isTarget && isCapture && <div className="absolute inset-0 ring-[5px] ring-inset ring-emerald-300/80 rounded-sm" />}
              {piece && !hideOrigin && (
                <img
                  key={slideStyle ? fen : "piece"}
                  src={pieceImages[pieceCode(piece.color, piece.type)]}
                  alt={`${piece.color}${piece.type}`}
                  draggable={false}
                  style={slideStyle}
                  className={`absolute inset-0 w-full h-full p-[4%] pointer-events-none ${slideStyle ? "chess-slide" : ""}`}
                />
              )}
              {showRank && (
                <span
                  className="absolute top-0.5 left-1 text-[9px] md:text-[11px] font-semibold pointer-events-none"
                  style={{ color: isLight ? boardTheme.coordOnLight : boardTheme.coordOnDark }}
                >
                  {rank}
                </span>
              )}
              {showFile && (
                <span
                  className="absolute bottom-0 right-1 text-[9px] md:text-[11px] font-semibold pointer-events-none"
                  style={{ color: isLight ? boardTheme.coordOnLight : boardTheme.coordOnDark }}
                >
                  {file}
                </span>
              )}
            </div>
          );
        })}

        {pendingPromotion && (
          <PromotionPicker
            color={position[pendingPromotion.from]?.color ?? turn}
            onPick={(p) => {
              const { from, to } = pendingPromotion;
              setPendingPromotion(null);
              onMove(from, to, p);
            }}
            onCancel={() => setPendingPromotion(null)}
          />
        )}
      </div>

      {drag?.moved && (
        <img
          src={pieceImages[drag.piece]}
          alt=""
          draggable={false}
          className="pointer-events-none z-50"
          style={{
            position: "fixed",
            left: drag.x - squareSize / 2,
            top: drag.y - squareSize / 2,
            width: squareSize,
            height: squareSize,
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))",
          }}
        />
      )}
    </div>
  );
};

export default ChessBoard;
