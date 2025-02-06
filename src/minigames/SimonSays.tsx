// SimonSaysGame.tsx
import React, { useState } from "react";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";

// A larger palette for up to a 4x4 grid (16 colors)
const ALL_COLORS = [
  "red", "green", "blue", "yellow",
  "purple", "orange", "teal", "pink",
  "lime", "cyan", "magenta", "brown",
  "gray", "gold", "silver", "maroon"
];

const SimonSaysGame: React.FC = () => {
  // Grid configuration: allow user to choose between 2 and 4 rows/columns.
  const [gridRows, setGridRows] = useState(2);
  const [gridCols, setGridCols] = useState(2);
  // Only use as many colors as cells in the grid.
  const colors = ALL_COLORS.slice(0, gridRows * gridCols);

  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [highlightedColor, setHighlightedColor] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("Click 'Start' to play!");

  // Start a new round by adding a random color from the available palette.
  const startRound = () => {
    setMessage("");
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
    setRound(newSequence.length);
    setIsDisplaying(true);
    setUserStep(0);
    displaySequence(newSequence);
  };

  // Display the sequence by highlighting each button in order.
  const displaySequence = (seq: string[]) => {
    let index = 0;
    const interval = setInterval(() => {
      setHighlightedColor(seq[index]);
      setTimeout(() => {
        setHighlightedColor(null);
      }, 500);
      index++;
      if (index >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDisplaying(false);
        }, 600);
      }
    }, 1000);
  };

  // Handle a user's button click.
  const handleUserClick = (color: string) => {
    if (paused || isDisplaying || gameOver) return;
    // Highlight the button when clicked.
    setHighlightedColor(color);
    setTimeout(() => {
      setHighlightedColor(null);
    }, 300);

    if (color === sequence[userStep]) {
      setUserStep((prev) => prev + 1);
      if (userStep + 1 === sequence.length) {
        // Correct sequence: add to score using a multiplier based on grid size.
        setScore((prev) => prev + sequence.length * 10 * (gridRows * gridCols));
        setTimeout(() => {
          startRound();
        }, 500);
      }
    } else {
      setGameOver(true);
    }
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  // Restart the game (also resets grid settings if needed).
  const restartGame = () => {
    setSequence([]);
    setUserStep(0);
    setIsDisplaying(false);
    setHighlightedColor(null);
    setGameOver(false);
    setScore(0);
    setRound(0);
    setMessage("Click 'Start' to play!");
  };

  // Handle grid row changes.
  const handleGridRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 2;
    if (value < 2) value = 2;
    if (value > 4) value = 4;
    setGridRows(value);
    // Reset the game if grid settings change.
    restartGame();
  };

  // Handle grid column changes.
  const handleGridColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 2;
    if (value < 2) value = 2;
    if (value > 4) value = 4;
    setGridCols(value);
    restartGame();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Simon Says</h1>

      {/* Grid settings controls */}
      <div className="mb-4 flex items-center">
        <label className="text-white mr-2">Rows:</label>
        <input
          type="number"
          value={gridRows}
          onChange={handleGridRowsChange}
          min={2}
          max={4}
          className="w-16 p-1 rounded bg-gray-800 border border-gray-700 text-white text-center"
        />
        <label className="text-white ml-4 mr-2">Columns:</label>
        <input
          type="number"
          value={gridCols}
          onChange={handleGridColsChange}
          min={2}
          max={4}
          className="w-16 p-1 rounded bg-gray-800 border border-gray-700 text-white text-center"
        />
      </div>

      <div className="mb-2">
        <PauseButton isPaused={paused} onTogglePause={togglePause} />
      </div>

      {/* Render the grid using dynamic number of columns */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleUserClick(color)}
            style={{
              backgroundColor: color,
              opacity: highlightedColor === color ? 0.5 : 1,
              transition: "opacity 0.3s",
            }}
            className="w-24 h-24 rounded-lg shadow-lg"
          />
        ))}
      </div>

      <div className="mt-4 text-white">
        <p>Round: {round}</p>
        <p>Score: {score}</p>
        <p>Multiplier: {gridRows * gridCols}x</p>
      </div>

      {/* Only show start button if no sequence is in play */}
      {!isDisplaying && sequence.length === 0 && !gameOver && (
        <button
          onClick={startRound}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start
        </button>
      )}

      <div className="mt-2 text-yellow-300">{message}</div>

      <GameOverModal
        isOpen={gameOver}
        score={score}
        gameName="simonsays"
        onClose={() => setGameOver(false)}
        onRestart={restartGame}
      />
    </div>
  );
};

export default SimonSaysGame;
