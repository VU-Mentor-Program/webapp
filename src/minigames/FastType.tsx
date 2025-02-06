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
  // Function: fetchCombinedSentence
  //
  // This function concurrently fetches from the Advice Slip API
  // (which returns JSON like { "slip": { "id": ..., "advice": "…" } })
  // and the ZenQuotes API (which returns JSON like
  // [ { "q": "…", "a": "…", "h": "…" } ]).
  // If both responses are valid, it returns the combined string.
  // If there is any error, it returns the fallback sentence.
  // -------------------------------
  const zenUrl = 'https://CorsProxy.io/https://zenquotes.io/api/random';
  const adviceUrl = 'https://CorsProxy.io/https://api.adviceslip.com/advice'

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
  // We fetch one sentence for the currentSentence and one for the queue.
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
  // When time runs out, count any partial input for the current sentence
  // and then call endGame.
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
  //
  // Called when time runs out. Computes the standard WPM (totalCorrectChars / 5 per minute)
  // and multiplies it by 100 for the final score. The score is then passed to GameOverModal.
  // -------------------------------
  const endGame = (finalTotal: number) => {
    setGameEnded(true);
    const wpm = (finalTotal / 5) / (duration / 60);
    const finalScore = Math.round(wpm * 100);
    setScore(finalScore);
  };

  // -------------------------------
  // Function: handleChange
  //
  // Called each time the user types. If the game has not yet started, it starts the game.
  // It updates the input and, when the user completes the current sentence, it adds the sentence’s
  // character count to the total, clears the input, and loads the next sentence from the queue.
  // Immediately when the user starts typing (i.e. when the first character is entered)
  // and if there isn’t already a next sentence in the queue, it pre-fetches one.
  // -------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!gameStarted) {
      setGameStarted(true);
      setTimeLeft(duration);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    if (!gameEnded) {
      setUserInput(value);
      // On the first character typed, if no next sentence is queued, pre-fetch one.
      if (value.length === 1 && sentenceQueue.length === 0 && !isFetchingNext) {
        setIsFetchingNext(true);
        fetchCombinedSentence().then(sentence => {
          setSentenceQueue(prev => [...prev, sentence]);
          setIsFetchingNext(false);
        });
      }
      // If the user completes the current sentence exactly…
      if (value === currentSentence) {
        setTotalCorrectChars(prev => prev + currentSentence.length);
        setUserInput('');
        // Shift the next sentence from the queue into currentSentence.
        if (sentenceQueue.length > 0) {
          const nextSentence = sentenceQueue[0];
          setCurrentSentence(nextSentence);
          setSentenceQueue(prev => prev.slice(1));
        } else {
          // If the queue is empty, fetch a sentence immediately.
          fetchCombinedSentence().then(sentence => {
            setCurrentSentence(sentence);
          });
        }
        // Pre-fetch another sentence to keep the queue non‑empty.
        if (!isFetchingNext) {
          setIsFetchingNext(true);
          fetchCombinedSentence().then(sentence => {
            setSentenceQueue(prev => [...prev, sentence]);
            setIsFetchingNext(false);
          });
        }
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
    // Reinitialize the sentence queue.
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
  //
  // Renders the current sentence character by character. Correct characters are green,
  // mistakes are red, and the next character to be typed is underlined.
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

        {/* Duration selection and countdown */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="text-gray-300 mr-2">Select Time:</label>
            <select
              value={duration}
              onChange={handleDurationChange}
              disabled={gameStarted}
              className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
            </select>
          </div>
          <div className="text-gray-300">Time Left: {timeLeft} sec</div>
        </div>

        {/* Start button (visible before the game starts) */}
        {!gameStarted && (
          <div className="text-center mb-4">
            <button
              onClick={() => {
                setGameStarted(true);
                setTimeLeft(duration);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Display the current sentence */}
        <div className="text-lg text-white mb-4 border border-gray-700 p-4 rounded">
          {renderSentence()}
        </div>

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

        {/* Restart button (visible when the game has ended) */}
        {gameEnded && (
          <div className="mt-6 text-center">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white"
            >
              Restart Game
            </button>
          </div>
        )}

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
