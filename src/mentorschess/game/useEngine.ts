import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineRequest, EngineResponse } from "./engine";

export function useEngine() {
  const workerRef = useRef<Worker | null>(null);
  const nextId = useRef(1);
  const pending = useRef(new Map<number, (move: string | null) => void>());
  const [thinking, setThinking] = useState(false);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL("./engine.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<EngineResponse>) => {
      const resolve = pending.current.get(e.data.id);
      if (!resolve) return; // stale response (cancelled)
      pending.current.delete(e.data.id);
      if (pending.current.size === 0) setThinking(false);
      resolve(e.data.move);
    };
    worker.onerror = () => {
      for (const resolve of pending.current.values()) resolve(null);
      pending.current.clear();
      setThinking(false);
    };
    workerRef.current = worker;
    return worker;
  }, []);

  const cancel = useCallback(() => {
    pending.current.clear();
    workerRef.current?.terminate();
    workerRef.current = null;
    setThinking(false);
  }, []);

  const requestMove = useCallback(
    (fen: string, level: number) =>
      new Promise<string | null>((resolve) => {
        const worker = ensureWorker();
        const id = nextId.current++;
        pending.current.set(id, resolve);
        setThinking(true);
        const request: EngineRequest = { id, fen, level };
        worker.postMessage(request);
      }),
    [ensureWorker],
  );

  useEffect(() => () => workerRef.current?.terminate(), []);

  return { requestMove, cancel, thinking };
}
