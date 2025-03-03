import React, { useState } from "react";
import GameOverModal from "../components/minigame page/GameOverModal";
import PauseButton from "../components/minigame page/PauseButton";
import { useTranslations } from "../contexts/TranslationContext";

// A larger palette for up to a 4x4 grid (16 colors)
const ALL_COLORS = [
  "red", "green", "blue", "yellow",
  "purple", "orange", "teal", "pink",
  "lime", "cyan", "magenta", "brown",
  "gray", "gold", "silver", "maroon"
];

// Mapping each tile color to a unique frequency (in Hz)
const tileSoundMapping: Record<string, number> = {
  red: 261.63,      // C4
  green: 293.66,    // D4
  blue: 329.63,     // E4
  yellow: 349.23,   // F4
  purple: 392.00,   // G4
  orange: 440.00,   // A4
  teal: 493.88,     // B4
  pink: 523.25,     // C5
  lime: 587.33,     // D5
  cyan: 659.26,     // E5
  magenta: 698.46,  // F5
  brown: 783.99,    // G5
  gray: 880.00,     // A5
  gold: 987.77,     // B5
  silver: 1046.50,  // C6
  maroon: 1174.66   // D6
};

// Helper function to play a sound for a given frequency using a smooth gain envelope.
function playSound(frequency: number, audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  const gainNode = audioCtx.createGain();
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

// Plays the unique sound for a given tile color.
function playTileSound(color: string, audioCtx: AudioContext) {
  const freq = tileSoundMapping[color];
  if (!freq) return;
  playSound(freq, audioCtx);
}

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
  // New: difficulty slider controls the display speed (in ms) for each sequence step.
  const [displaySpeed, setDisplaySpeed] = useState(1000);

  const t = useTranslations("minigames");

  // Audio: create a persistent AudioContext.
  const [audioCtx] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());

  // Start a new round by adding a random color from the available palette.
  const startRound = () => {
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
    setRound(newSequence.length);
    setIsDisplaying(true);
    setUserStep(0);
    displaySequence(newSequence);
  };

  // Display the sequence by highlighting each button in order and playing its sound.
  const displaySequence = (seq: string[]) => {
    let index = 0;
    const interval = setInterval(() => {
      setHighlightedColor(seq[index]);
      // Play the sound for this color.
      playTileSound(seq[index], audioCtx);
      setTimeout(() => {
        setHighlightedColor(null);
      }, displaySpeed / 2);
      index++;
      if (index >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDisplaying(false);
        }, displaySpeed / 2 + 100);
      }
    }, displaySpeed);
  };

  // Handle a user's button click.
  const handleUserClick = (color: string) => {
    if (paused || isDisplaying || gameOver) return;
    // Play the tile's sound immediately.
    playTileSound(color, audioCtx);
    // Temporarily highlight the button.
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

  // Handle difficulty (display speed) changes.
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySpeed(parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Simon Says</h1>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            {t("rows")} {gridRows}
          </label>
          <input
            type="range"
            step="1"
            value={gridRows}
            onChange={handleGridRowsChange}
            min={2}
            max={4}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ marginRight: "1rem" }}>
            {t("columns")} {gridCols}
          </label>
          <input
            type="range"
            step="1"
            value={gridCols}
            onChange={handleGridColsChange}
            min={2}
            max={4}
          />
        </div>
        <div>
          <label style={{ marginRight: "1rem" }}>
            {t("sequence_speed")} {displaySpeed} ms
          </label>
          <input
            type="range"
            step="50"
            value={displaySpeed}
            onChange={handleDifficultyChange}
            min={300}
            max={2000}
          />
        </div>
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
        <p>
          {t("round")} {round}
        </p>
        <p>
          {t("score")} {score}
        </p>
      </div>

      {/* Only show start button if no sequence is in play */}
      {!isDisplaying && sequence.length === 0 && !gameOver && (
        <button
          onClick={startRound}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t("start_game")}
        </button>
      )}

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
