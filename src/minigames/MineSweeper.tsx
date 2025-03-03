// MinesweeperGame.tsx
import React, { useEffect, useRef, useState } from 'react';
import mpLogoCircle from '../assets/mp_logo-CIRCLE.png'; // Bomb image
import GameOverModal from '../components/minigame page/GameOverModal';
import { useTranslations } from '../contexts/TranslationContext';

// Define a cell in the board.
interface Cell {
  bomb: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

// Helper functions to generate the board.
const generateEmptyBoard = (rows: number, cols: number): Cell[][] =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      bomb: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

const placeBombs = (board: Cell[][], bombCount: number): void => {
  const rows = board.length;
  const cols = board[0].length;
  let placed = 0;
  while (placed < bombCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].bomb) {
      board[r][c].bomb = true;
      placed++;
    }
  }
};

const calculateAdjacents = (board: Cell[][]): void => {
  const rows = board.length;
  const cols = board[0].length;
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].bomb) continue;
      let count = 0;
      directions.forEach(([dr, dc]) => {
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].bomb)
          count++;
      });
      board[r][c].adjacent = count;
    }
  }
};

const generateBoard = (rows: number, cols: number, bombCount: number): Cell[][] => {
  const board = generateEmptyBoard(rows, cols);
  placeBombs(board, bombCount);
  calculateAdjacents(board);
  return board;
};

// A helper function to compute final score.
// Each revealed safe cell gives 10 points.
// Each correctly flagged bomb gives 50 points.
// Every second elapsed subtracts 2 points.
const computeScore = (board: Cell[][], timeElapsed: number): number => {
  let safeCount = 0;
  let flaggedBombs = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c];
      if (cell.revealed && !cell.bomb) safeCount++;
      if (cell.flagged && cell.bomb) flaggedBombs++;
    }
  }
  return safeCount * 10 + flaggedBombs * 50 - timeElapsed * 2;
};

const MinesweeperGame: React.FC = () => {
  // Customization states.
  // Bound-check: minimum rows and columns are 5.
  const [rows, setRows] = useState<number>(9);
  const [cols, setCols] = useState<number>(9);
  // Minimum bombs is 3; maximum bombs is (rows * cols - 1).
  const [bombCount, setBombCount] = useState<number>(10);

  // Board state.
  const [board, setBoard] = useState<Cell[][]>(generateBoard(rows, cols, bombCount));

  // Game status.
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);

  // Timer and score.
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Bomb image loaded state.
  const [bombImgLoaded, setBombImgLoaded] = useState<boolean>(false);
  const bombImgRef = useRef<HTMLImageElement | null>(null);

  // Load the bomb image.
  useEffect(() => {
    const img = new Image();
    img.src = mpLogoCircle;
    img.onload = () => {
      bombImgRef.current = img;
      setBombImgLoaded(true);
    };
  }, []);

  // When board customization changes, start a new game.
  useEffect(() => {
    // Ensure bombCount does not exceed available cells - 1.
    const maxBombs = rows * cols - 1;
    const validBombCount = Math.min(bombCount, maxBombs);
    setBombCount(validBombCount);
    setBoard(generateBoard(rows, cols, validBombCount));
    setGameOver(false);
    setWin(false);
    setTimeElapsed(0);
    setScore(0);
  }, [rows, cols, bombCount]);

  // Timer: increment every second if game is not over.
  useEffect(() => {
    if (win) {
      console.log("yay!");
    }
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Reset the game.
  const resetGame = () => {
    setBoard(generateBoard(rows, cols, bombCount));
    setGameOver(false);
    setWin(false);
    setTimeElapsed(0);
    setScore(0);
  };

  // Reveal cell at (r, c). Left‑click action.
  const revealCell = (r: number, c: number) => {
    if (gameOver) return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (newBoard[r][c].bomb) {
      // Hit a bomb: reveal all bombs.
      newBoard[r][c].revealed = true;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newBoard[i][j].bomb) newBoard[i][j].revealed = true;
        }
      }
      setBoard(newBoard);
      setGameOver(true);
      // Compute final score.
      setScore(computeScore(newBoard, timeElapsed));
    } else {
      floodFill(newBoard, r, c);
      setBoard(newBoard);
      // Check win: all non‑bomb cells revealed.
      let unrevealedCount = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!newBoard[i][j].revealed && !newBoard[i][j].bomb) {
            unrevealedCount++;
          }
        }
      }
      if (unrevealedCount === 0) {
        setWin(true);
        setGameOver(true);
        setScore(computeScore(newBoard, timeElapsed));
      }
    }
  };

  // Flood-fill reveal for cells with 0 adjacent bombs.
  const floodFill = (board: Cell[][], r: number, c: number) => {
    const rowsCount = board.length;
    const colsCount = board[0].length;
    const stack: [number, number][] = [[r, c]];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      if (r < 0 || r >= rowsCount || c < 0 || c >= colsCount) continue;
      const cell = board[r][c];
      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;
      if (cell.adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            stack.push([r + dr, c + dc]);
          }
        }
      }
    }
  };

  // Toggle a flag on right‑click.
  const toggleFlag = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
  };

  // Common button styling.
  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    background: '#444',
    color: 'white',
    cursor: 'pointer',
    margin: '0.5rem',
    transition: 'background 0.3s ease',
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.background = '#666';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.background = '#444';
  };

  const t = useTranslations('minigames');

  return (
    <div style={{ textAlign: 'center', color: 'white', padding: '1rem' }}>
      <h3>Minesweeper</h3>
      <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
        <span style={{ marginRight: '1rem' }}>Time: {timeElapsed} sec</span>
        <span>{t("score")} {score}</span>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            {t("rows")} {rows}
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={rows}
            onChange={(e) => setRows(Math.max(5, Number(e.target.value)))}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            {t("columns")} {cols}
          </label>
          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={cols}
            onChange={(e) => setCols(Math.max(5, Number(e.target.value)))}
          />
        </div>
        <div>
          <label style={{ marginRight: "1rem" }}>
            {t("bombs")} {bombCount}
          </label>
          <input
            type="range"
            min="1"
            max={(rows * cols - 1)}
            step="1"
            value={bombCount}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              // Maximum bombs allowed is (rows * cols - 1)
              const maxBombs = rows * cols - 1;
              setBombCount(Math.max(3, Math.min(newValue, maxBombs)));
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={resetGame}
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {t("start_game")}
        </button>
      </div>
      <div style={{ display: 'inline-block', border: '2px solid #888' }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => (
              <div
                key={c}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
                style={{
                  width: '30px',
                  height: '30px',
                  border: '1px solid #444',
                  background: cell.revealed ? '#ddd' : '#777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: '14px',
                  color: cell.bomb ? 'red' : 'black',
                }}
              >
                {cell.revealed ? (
                  cell.bomb ? (
                    bombImgLoaded && bombImgRef.current ? (
                      <img src={mpLogoCircle} alt="bomb" style={{ width: '24px', height: '24px' }} />
                    ) : (
                      'B'
                    )
                  ) : cell.adjacent > 0 ? (
                    cell.adjacent
                  ) : (
                    ''
                  )
                ) : cell.flagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName={"minesweeper"}
        onClose={resetGame}
        onRestart={resetGame}
      />
    </div>
  );
};

export default MinesweeperGame;
