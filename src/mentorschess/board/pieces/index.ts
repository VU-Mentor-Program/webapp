// cburnett chess piece set (CC BY-SA 3.0) — https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
import wK from "./Chess_klt45.svg";
import wQ from "./Chess_qlt45.svg";
import wR from "./Chess_rlt45.svg";
import wB from "./Chess_blt45.svg";
import wN from "./Chess_nlt45.svg";
import wP from "./Chess_plt45.svg";
import bK from "./Chess_kdt45.svg";
import bQ from "./Chess_qdt45.svg";
import bR from "./Chess_rdt45.svg";
import bB from "./Chess_bdt45.svg";
import bN from "./Chess_ndt45.svg";
import bP from "./Chess_pdt45.svg";
import type { Color, PieceSymbol } from "chess.js";

export type PieceCode = `${Color}${Uppercase<PieceSymbol>}`;

export const pieceImages: Record<PieceCode, string> = {
  wK, wQ, wR, wB, wN, wP,
  bK, bQ, bR, bB, bN, bP,
};

export const pieceCode = (color: Color, type: PieceSymbol): PieceCode =>
  `${color}${type.toUpperCase() as Uppercase<PieceSymbol>}`;
