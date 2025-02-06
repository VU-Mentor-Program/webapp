// Game2048.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  TouchEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

// Constants for cell dimensions
const CELL_SIZE = 80; // pixels
const GAP = 10; // pixels

// Each tile now carries its own identity and position.
interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  // A flag to mark that this tile has just merged (so that it cannot merge twice in one move)
  merged?: boolean;
}

const Game2048: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(4);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // A simple counter for generating unique tile IDs.
  const tileIdCounter = useRef(0);
  const getNewTileId = () => {
    tileIdCounter.current++;
    return tileIdCounter.current;
  };

  // Initialize a new game: reset score, clear tiles, and add two random tiles.
  const initializeGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setTiles([]); // clear all tiles

    // Add two random tiles.
    setTiles(() => {
      const newTiles: Tile[] = [];
      // All positions in the grid are initially empty.
      const emptyCells: { r: number; c: number }[] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          emptyCells.push({ r, c });
        }
      }
      // Add two tiles at random empty cells.
      for (let i = 0; i < 2; i++) {
        if (emptyCells.length === 0) break;
        const index = Math.floor(Math.random() * emptyCells.length);
        const cell = emptyCells.splice(index, 1)[0];
        newTiles.push({
          id: getNewTileId(),
          value: Math.random() < 0.9 ? 2 : 4,
          row: cell.r,
          col: cell.c,
        });
      }
      return newTiles;
    });
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // // Returns all empty positions in the grid (positions not occupied by a tile).
  // const getEmptyCells = () => {
  //   const emptyCells: { r: number; c: number }[] = [];
  //   for (let r = 0; r < gridSize; r++) {
  //     for (let c = 0; c < gridSize; c++) {
  //       if (!tiles.some((tile) => tile.row === r && tile.col === c)) {
  //         emptyCells.push({ r, c });
  //       }
  //     }
  //   }
  //   return emptyCells;
  // };

  // Add a random tile (if there is an empty cell) to the provided tile array.
  const addRandomTile = (currentTiles: Tile[]): Tile[] => {
    const emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!currentTiles.some((tile) => tile.row === r && tile.col === c)) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return currentTiles;
    const index = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[index];
    return [
      ...currentTiles,
      {
        id: getNewTileId(),
        value: Math.random() < 0.9 ? 2 : 4,
        row: cell.r,
        col: cell.c,
      },
    ];
  };

  // Check if any moves remain. We build a grid (2D array) from the tiles array.
  const canMove = (tiles: Tile[]): boolean => {
    const grid = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(0)
    );
    tiles.forEach((tile) => {
      grid[tile.row][tile.col] = tile.value;
    });
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 0) return true;
        if (c < gridSize - 1 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < gridSize - 1 && grid[r][c] === grid[r + 1][c]) return true;
      }
    }
    return false;
  };

  // **************** Movement Functions ****************
  //
  // Each move function works by processing one row or column at a time.
  // For example, when moving left, for each row we:
  //   1. Get the tiles in that row (sorted by col).
  //   2. Slide them left (assign new col positions starting at 0).
  //   3. Merge adjacent equal tiles (only once per move).
  //   4. Mark that a move occurred if any tile’s position changed or if a merge happened.
  //
  // (The functions for right, up, and down work similarly.)
  // ******************************************************

  const moveLeft = () => {
    let moved = false;
    let scoreGained = 0;
    // Make a deep copy and clear any merge flags.
    const newTiles = tiles.map((tile) => ({ ...tile, merged: false }));
    for (let r = 0; r < gridSize; r++) {
      // Get all tiles in this row in order from left to right.
      const rowTiles = newTiles
        .filter((tile) => tile.row === r)
        .sort((a, b) => a.col - b.col);
      let targetCol = 0;
      for (let i = 0; i < rowTiles.length; i++) {
        const tile = rowTiles[i];
        // If possible, try to merge with the tile we just placed.
        if (targetCol > 0) {
          const lastTile = newTiles.find(
            (t) => t.row === r && t.col === targetCol - 1
          );
          if (
            lastTile &&
            !lastTile.merged &&
            lastTile.value === tile.value
          ) {
            // Merge: double the value, mark as merged.
            lastTile.value *= 2;
            lastTile.merged = true;
            scoreGained += lastTile.value;
            // Remove the current tile (we mark it by moving it off-grid).
            tile.row = -1;
            moved = true;
            continue;
          }
        }
        if (tile.col !== targetCol) {
          moved = true;
          tile.col = targetCol;
        }
        targetCol++;
      }
    }
    // Remove any tile that was merged away (row === -1).
    const filteredTiles = newTiles.filter((tile) => tile.row !== -1);
    return { newTiles: filteredTiles, scoreGained, moved };
  };

  const moveRight = () => {
    let moved = false;
    let scoreGained = 0;
    const newTiles = tiles.map((tile) => ({ ...tile, merged: false }));
    for (let r = 0; r < gridSize; r++) {
      // Process the row from rightmost to leftmost.
      const rowTiles = newTiles
        .filter((tile) => tile.row === r)
        .sort((a, b) => b.col - a.col);
      let targetCol = gridSize - 1;
      for (let i = 0; i < rowTiles.length; i++) {
        const tile = rowTiles[i];
        if (targetCol < gridSize - 1) {
          const lastTile = newTiles.find(
            (t) => t.row === r && t.col === targetCol + 1
          );
          if (
            lastTile &&
            !lastTile.merged &&
            lastTile.value === tile.value
          ) {
            lastTile.value *= 2;
            lastTile.merged = true;
            scoreGained += lastTile.value;
            tile.row = -1;
            moved = true;
            continue;
          }
        }
        if (tile.col !== targetCol) {
          moved = true;
          tile.col = targetCol;
        }
        targetCol--;
      }
    }
    const filteredTiles = newTiles.filter((tile) => tile.row !== -1);
    return { newTiles: filteredTiles, scoreGained, moved };
  };

  const moveUp = () => {
    let moved = false;
    let scoreGained = 0;
    const newTiles = tiles.map((tile) => ({ ...tile, merged: false }));
    for (let c = 0; c < gridSize; c++) {
      // Process the column from top to bottom.
      const colTiles = newTiles
        .filter((tile) => tile.col === c)
        .sort((a, b) => a.row - b.row);
      let targetRow = 0;
      for (let i = 0; i < colTiles.length; i++) {
        const tile = colTiles[i];
        if (targetRow > 0) {
          const lastTile = newTiles.find(
            (t) => t.col === c && t.row === targetRow - 1
          );
          if (
            lastTile &&
            !lastTile.merged &&
            lastTile.value === tile.value
          ) {
            lastTile.value *= 2;
            lastTile.merged = true;
            scoreGained += lastTile.value;
            tile.row = -1;
            moved = true;
            continue;
          }
        }
        if (tile.row !== targetRow) {
          moved = true;
          tile.row = targetRow;
        }
        targetRow++;
      }
    }
    const filteredTiles = newTiles.filter((tile) => tile.row !== -1);
    return { newTiles: filteredTiles, scoreGained, moved };
  };

  const moveDown = () => {
    let moved = false;
    let scoreGained = 0;
    const newTiles = tiles.map((tile) => ({ ...tile, merged: false }));
    for (let c = 0; c < gridSize; c++) {
      // Process the column from bottom to top.
      const colTiles = newTiles
        .filter((tile) => tile.col === c)
        .sort((a, b) => b.row - a.row);
      let targetRow = gridSize - 1;
      for (let i = 0; i < colTiles.length; i++) {
        const tile = colTiles[i];
        if (targetRow < gridSize - 1) {
          const lastTile = newTiles.find(
            (t) => t.col === c && t.row === targetRow + 1
          );
          if (
            lastTile &&
            !lastTile.merged &&
            lastTile.value === tile.value
          ) {
            lastTile.value *= 2;
            lastTile.merged = true;
            scoreGained += lastTile.value;
            tile.row = -1;
            moved = true;
            continue;
          }
        }
        if (tile.row !== targetRow) {
          moved = true;
          tile.row = targetRow;
        }
        targetRow--;
      }
    }
    const filteredTiles = newTiles.filter((tile) => tile.row !== -1);
    return { newTiles: filteredTiles, scoreGained, moved };
  };

  // Process a move based on direction. (Keyboard and touch events call this.)
  const handleMove = useCallback(
    (direction: string) => {
      if (paused || gameOver) return;
      let result:
        | { newTiles: Tile[]; scoreGained: number; moved: boolean }
        | undefined;
      if (direction === "left") result = moveLeft();
      else if (direction === "right") result = moveRight();
      else if (direction === "up") result = moveUp();
      else if (direction === "down") result = moveDown();

      if (result && result.moved) {
        const updatedScore = score + result.scoreGained;
        setScore(updatedScore);
        // After the move, add a new random tile.
        let newTiles = addRandomTile(result.newTiles);
        setTiles(newTiles);
        if (!canMove(newTiles)) {
          setGameOver(true);
        }
      }
    },
    [paused, gameOver, score, tiles, gridSize]
  );

  // **************** Keyboard Handling ****************
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (paused || gameOver) return;
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowLeft":
          handleMove("left");
          break;
        case "ArrowRight":
          handleMove("right");
          break;
        case "ArrowUp":
          handleMove("up");
          break;
        case "ArrowDown":
          handleMove("down");
          break;
        default:
          break;
      }
    },
    [handleMove, paused, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // **************** Touch Handling ****************
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 30; // minimal swipe distance
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) handleMove("right");
      else if (deltaX < -threshold) handleMove("left");
    } else {
      if (deltaY > threshold) handleMove("down");
      else if (deltaY < -threshold) handleMove("up");
    }
    setTouchStart(null);
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  const restartGame = () => {
    initializeGame();
  };

  // Handle grid size changes.
  const handleGridSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newSize = parseInt(e.target.value);
    if (isNaN(newSize)) newSize = 4;
    if (newSize < 4) newSize = 4;
    if (newSize > 8) newSize = 8;
    setGridSize(newSize);
    initializeGame();
  };

  // Compute the board container’s size in pixels.
  const boardSizeInPx = gridSize * CELL_SIZE + (gridSize + 1) * GAP;

  // **************** Render ****************
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">2048</h1>
      <div className="mb-2">
        <PauseButton isPaused={paused} onTogglePause={togglePause} />
      </div>

      {/* Grid Size Control */}
      <div className="mb-4 flex items-center">
        <label className="text-white mr-2">Grid Size:</label>
        <input
          type="number"
          min="4"
          max="8"
          value={gridSize}
          onChange={handleGridSizeChange}
          className="w-16 p-1 rounded bg-gray-800 border border-gray-700 text-white text-center"
        />
      </div>

      {/* Board Container with Touch Handlers */}
      <div
        className="relative rounded"
        style={{
          width: boardSizeInPx,
          height: boardSizeInPx,
          backgroundColor: "#bbada0",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Background Grid Cells */}
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((_, c) => {
            const left = GAP + c * (CELL_SIZE + GAP);
            const top = GAP + r * (CELL_SIZE + GAP);
            return (
              <div
                key={`bg-${r}-${c}`}
                className="absolute rounded"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left,
                  top,
                  backgroundColor: "#ccc0b3",
                }}
              />
            );
          })
        )}

        {/* Render Tiles with Framer Motion animations */}
        <AnimatePresence>
          {tiles.map((tile) => {
            const left = GAP + tile.col * (CELL_SIZE + GAP);
            const top = GAP + tile.row * (CELL_SIZE + GAP);
            // Get tile colors based on value.
            const getTileColors = (value: number) => {
              switch (value) {
                case 2:
                  return { backgroundColor: "#eee4da", color: "#776e65" };
                case 4:
                  return { backgroundColor: "#ede0c8", color: "#776e65" };
                case 8:
                  return { backgroundColor: "#f2b179", color: "#f9f6f2" };
                case 16:
                  return { backgroundColor: "#f59563", color: "#f9f6f2" };
                case 32:
                  return { backgroundColor: "#f67c5f", color: "#f9f6f2" };
                case 64:
                  return { backgroundColor: "#f65e3b", color: "#f9f6f2" };
                case 128:
                  return { backgroundColor: "#edcf72", color: "#f9f6f2" };
                case 256:
                  return { backgroundColor: "#edcc61", color: "#f9f6f2" };
                case 512:
                  return { backgroundColor: "#edc850", color: "#f9f6f2" };
                case 1024:
                  return { backgroundColor: "#edc53f", color: "#f9f6f2" };
                case 2048:
                  return { backgroundColor: "#edc22e", color: "#f9f6f2" };
                default:
                  return { backgroundColor: "#3c3a32", color: "#f9f6f2" };
              }
            };
            const { backgroundColor, color } = getTileColors(tile.value);
            return (
              <motion.div
                key={tile.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1, left, top }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute flex items-center justify-center rounded font-bold"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor,
                  color,
                  fontSize: 24,
                  position: "absolute",
                }}
              >
                {tile.value}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-white">Score: {score}</div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="2048"
        onClose={() => setGameOver(false)}
        onRestart={restartGame}
      />
    </div>
  );
};

export default Game2048;
