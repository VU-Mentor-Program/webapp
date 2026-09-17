import React from "react";
import type { Color, PieceSymbol } from "chess.js";
import { pieceCode, pieceImages } from "./pieces";

const CHOICES: PieceSymbol[] = ["q", "r", "b", "n"];

interface PromotionPickerProps {
  color: Color;
  onPick: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionPicker: React.FC<PromotionPickerProps> = ({ color, onPick, onCancel }) => (
  <div
    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/75 backdrop-blur-[2px] rounded-lg"
    onClick={onCancel}
  >
    <div
      className="flex gap-2 p-2 rounded-xl bg-white/10 border border-white/20 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {CHOICES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/50 transition-colors cursor-pointer flex items-center justify-center"
          aria-label={`Promote to ${p}`}
        >
          <img src={pieceImages[pieceCode(color, p)]} alt={p} className="w-11 h-11 md:w-12 md:h-12" draggable={false} />
        </button>
      ))}
    </div>
  </div>
);

export default PromotionPicker;
