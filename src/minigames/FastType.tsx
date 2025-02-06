// TypingGame.tsx
import React, { useState, useEffect, useRef } from 'react';
import GameOverModal from '../components/minigame page/GameOverModal'; // Adjust the path as needed

const TypingGame: React.FC = () => {
  // -------------------------------
  // State for current sentence and queue of sentences
  // -------------------------------
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [sentenceQueue, setSentenceQueue] = useState<string[]>([]);

  // -------------------------------
  // Input and game state
  // -------------------------------
  const [userInput, setUserInput] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  
  // Countdown state (null means no countdown in progress)
  const [countdown, setCountdown] = useState<number | null>(null);

  // -------------------------------
  // Timer and scoring state
  // -------------------------------
  const [duration, setDuration] = useState<number>(60); // default duration in seconds
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [totalCorrectChars, setTotalCorrectChars] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // -------------------------------
  // Flag to avoid double‑fetching the next sentence
  // -------------------------------
  const [isFetchingNext, setIsFetchingNext] = useState<boolean>(false);

  // -------------------------------
  // Refs to hold latest values in asynchronous callbacks
  // -------------------------------
  const inputRef = useRef<HTMLInputElement>(null);
  const userInputRef = useRef(userInput);
  const totalCorrectCharsRef = useRef(totalCorrectChars);
  const currentSentenceRef = useRef(currentSentence);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    totalCorrectCharsRef.current = totalCorrectChars;
  }, [totalCorrectChars]);

  useEffect(() => {
    currentSentenceRef.current = currentSentence;
  }, [currentSentence]);

  // -------------------------------
  // Auto-focus effect when game starts
  // -------------------------------
  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted]);

  // -------------------------------
  // Pre-game Countdown Effect
  // When countdown is active, decrease it every second.
  // When countdown reaches 0, start the game and auto-focus the input.
  // -------------------------------
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished: start game.
        setGameStarted(true);
        setTimeLeft(duration);
        setCountdown(null);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  }, [countdown, duration]);

  // -------------------------------
  // Function: fetchCombinedSentence
  // Uses a CORS proxy for both APIs.
  // -------------------------------
  const zenUrl = 'https://CorsProxy.io/https://zenquotes.io/api/random';
  const adviceUrl = 'https://CorsProxy.io/https://api.adviceslip.com/advice';

  const fetchCombinedSentence = async (): Promise<string> => {
    try {
      const [adviceRes, zenRes] = await Promise.all([
        fetch(adviceUrl, { cache: 'no-store' }),
        fetch(zenUrl, { cache: 'no-store' })
      ]);
      const adviceData = await adviceRes.json();
      const zenData = await zenRes.json();

      if (
        adviceData.slip &&
        adviceData.slip.advice &&
        zenData[0] &&
        zenData[0].q
      ) {
        // Concatenate the two sentences with a space between.
        return `${adviceData.slip.advice} ${zenData[0].q}`;
      } else {
        return 'The quick brown fox jumps over the lazy dog.';
      }
    } catch (error) {
      console.error('Error fetching advice/quote:', error);
      return 'The quick brown fox jumps over the lazy dog.';
    }
  };

  // -------------------------------
  // On component mount, load the initial sentences.
  // -------------------------------
  useEffect(() => {
    const loadInitialSentences = async () => {
      const sentence1 = await fetchCombinedSentence();
      const sentence2 = await fetchCombinedSentence();
      setCurrentSentence(sentence1);
      setSentenceQueue([sentence2]);
    };
    loadInitialSentences();
  }, []);

  // -------------------------------
  // Timer: count down every second once the game starts.
  // -------------------------------
  useEffect(() => {
    if (gameStarted && !gameEnded) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Count correct characters from the current (partial) input.
            let currentCorrectCount = 0;
            const curSentence = currentSentenceRef.current;
            const curInput = userInputRef.current;
            for (let i = 0; i < curInput.length; i++) {
              if (curInput[i] === curSentence[i]) {
                currentCorrectCount++;
              }
            }
            const finalTotal = totalCorrectCharsRef.current + currentCorrectCount;
            endGame(finalTotal);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameEnded, duration]);

  // -------------------------------
  // Function: endGame
  // Computes WPM and multiplies by 100.
  // -------------------------------
  const endGame = (finalTotal: number) => {
    setGameEnded(true);
    const wpm = (finalTotal / 5) / (duration / 60);
    const finalScore = Math.round(wpm * 100);
    setScore(finalScore);
  };

  // -------------------------------
  // Function: handleChange
  // Called as the user types.
  // -------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!gameStarted || gameEnded) return;
    
    setUserInput(value);
    // Pre-fetch next sentence if needed.
    if (value.length === 1 && sentenceQueue.length === 0 && !isFetchingNext) {
      setIsFetchingNext(true);
      fetchCombinedSentence().then(sentence => {
        setSentenceQueue(prev => [...prev, sentence]);
        setIsFetchingNext(false);
      });
    }
    // When the user completes the current sentence:
    if (value === currentSentence) {
      setTotalCorrectChars(prev => prev + currentSentence.length);
      setUserInput('');
      if (sentenceQueue.length > 0) {
        const nextSentence = sentenceQueue[0];
        setCurrentSentence(nextSentence);
        setSentenceQueue(prev => prev.slice(1));
      } else {
        fetchCombinedSentence().then(sentence => {
          setCurrentSentence(sentence);
        });
      }
      if (!isFetchingNext) {
        setIsFetchingNext(true);
        fetchCombinedSentence().then(sentence => {
          setSentenceQueue(prev => [...prev, sentence]);
          setIsFetchingNext(false);
        });
      }
    }
  };

  // -------------------------------
  // Function: handleDurationChange
  // -------------------------------
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = Number(e.target.value);
    setDuration(newDuration);
    if (!gameStarted) {
      setTimeLeft(newDuration);
    }
  };

  // -------------------------------
  // Function: resetGame
  // -------------------------------
  const resetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setTimeLeft(duration);
    setUserInput('');
    setTotalCorrectChars(0);
    setScore(0);
    setCountdown(null);
    const loadInitialSentences = async () => {
      const sentence1 = await fetchCombinedSentence();
      const sentence2 = await fetchCombinedSentence();
      setCurrentSentence(sentence1);
      setSentenceQueue([sentence2]);
    };
    loadInitialSentences();
  };

  // -------------------------------
  // Function: renderSentence
  // Renders the current sentence character by character.
  // -------------------------------
  const renderSentence = () => {
    return currentSentence.split('').map((char, index) => {
      let spanClass = 'transition-colors duration-200 ';
      if (index < userInput.length) {
        spanClass += userInput[index] === char ? 'text-green-500' : 'text-red-500';
      } else {
        spanClass += 'text-white';
      }
      if (!gameEnded && index === userInput.length) {
        spanClass += ' underline';
      }
      return (
        <span key={index} className={spanClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="bg-gray-800 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Typing Game
        </h1>

        {/* Duration selection and countdown display */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="text-gray-300 mr-2">Select Time:</label>
            <select
              value={duration}
              onChange={handleDurationChange}
              disabled={gameStarted || countdown !== null}
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
            </select>
          </div>
          <div className="text-gray-300">Time Left: {timeLeft} sec</div>
        </div>

        {/* Start button or countdown display */}
        {!gameStarted && countdown === null && (
          <div className="text-center mb-4">
            <button
              onClick={() => setCountdown(3)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
            >
              Start Game
            </button>
          </div>
        )}
        {countdown !== null && !gameStarted && (
          <div className="text-center mb-4 text-4xl text-white">
            {countdown > 0 ? countdown : 'Go!'}
          </div>
        )}

        {/* Display the current sentence during countdown and after game start */}
        {(gameStarted || countdown !== null) && (
          <div className="text-lg text-white mb-4 border border-gray-700 p-4 rounded">
            {renderSentence()}
          </div>
        )}

        {/* Typing input field */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleChange}
          disabled={!gameStarted || gameEnded}
          placeholder="Start typing here..."
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* GameOverModal for submitting the score */}
        <GameOverModal
          isOpen={gameEnded}
          score={score}
          gameName="fasttype"
          onClose={resetGame}
          onRestart={resetGame}
        />
      </div>
    </div>
  );
};

export default TypingGame;
