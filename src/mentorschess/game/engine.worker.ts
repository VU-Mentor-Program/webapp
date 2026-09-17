// Thin Web Worker wrapper around the engine so the UI never blocks while the bot thinks.
import { chooseMove, type EngineRequest, type EngineResponse } from "./engine";

self.onmessage = (e: MessageEvent<EngineRequest>) => {
  const { id, fen, level } = e.data;
  let move: string | null = null;
  try {
    move = chooseMove(fen, level);
  } catch {
    move = null;
  }
  const response: EngineResponse = { id, move };
  postMessage(response);
};
