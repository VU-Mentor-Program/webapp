import React, { useState, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from "../contexts/TranslationContext";
import GameOverModal from "../components/minigame page/GameOverModal";

// Tile status types
type Status = 'correct' | 'present' | 'absent' | '';
type Tile = { letter: string; status: Status };

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const WordleGame: React.FC = () => {
  const [solution, setSolution] = useState<string>('');
  const [board, setBoard] = useState<Tile[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing'|'won'|'lost'>('playing');
  const [letterStatuses, setLetterStatuses] = useState<Record<string, Status>>({});
  const [shakeRow, setShakeRow] = useState(false);
  const [score, setScore] = useState<number>(0);
  const t = useTranslations('minigames');

  useEffect(() => {
    setBoard(Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: WORD_LENGTH }, () => ({ letter: '', status: '' }))
    ));
    fetchRandomWord();
  }, []);

  const fetchRandomWord = async () => {
    try {
      const res = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data: string[] = await res.json();
      setSolution(data[0].toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  const validateWord = async (word: string) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return res.ok;
    } catch {
      return false;
    }
  };

  const updateStatuses = (guess: string, statuses: Status[]) => {
    const updated = { ...letterStatuses };
    guess.split('').forEach((ch, i) => {
      const upper = ch.toUpperCase();
      const prev = updated[upper] || '';
      if (
        statuses[i] === 'correct' ||
        (statuses[i] === 'present' && prev !== 'correct') ||
        (statuses[i] === 'absent' && prev === '')
      ) {
        updated[upper] = statuses[i];
      }
    });
    setLetterStatuses(updated);
  };

  const calculateScore = (attemptsUsed: number) => Math.max(0, 1000 - (attemptsUsed - 1) * 150);

  const finalizeGame = (won: boolean) => {
    const finalScore = won ? calculateScore(attempt + 1) : 0;
    setScore(finalScore);
    setGameStatus(won ? 'won' : 'lost');
  };

  const handleSubmit = async () => {
    if (currentGuess.length !== WORD_LENGTH || gameStatus !== 'playing') return;
    const isValid = await validateWord(currentGuess);
    if (!isValid) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 600);
      return;
    }

    const solChars = solution.split('');
    const guessChars = currentGuess.split('');
    const statuses: Status[] = guessChars.map((char, i) => {
      if (solChars[i] === char) return 'correct';
      if (solChars.includes(char)) return 'present';
      return 'absent';
    });

    const newBoard = [...board];
    newBoard[attempt] = guessChars.map((ch, i) => ({ letter: ch.toUpperCase(), status: statuses[i] }));
    setBoard(newBoard);
    updateStatuses(currentGuess, statuses);

    if (currentGuess === solution) return finalizeGame(true);
    if (attempt + 1 === MAX_ATTEMPTS) return finalizeGame(false);

    setAttempt(a => a + 1);
    setCurrentGuess('');
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (gameStatus !== 'playing') return;
    if (e.key === 'Backspace') { setCurrentGuess(c => c.slice(0, -1)); return; }
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(c => c + e.key.toLowerCase());
    }
  };

  const handleClickKey = (key: string) => {
    if (gameStatus !== 'playing') return;
    if (key === 'ENTER') handleSubmit();
    else if (key === 'DEL') setCurrentGuess(c => c.slice(0, -1));
    else if (currentGuess.length < WORD_LENGTH) setCurrentGuess(c => c + key.toLowerCase());
  };

  const flipVariants = {
    hidden: { rotateX: 0 },
    visible: (i: number) => ({
      rotateX: [0, 90, 0],
      transition: { delay: attempt * 0.2 + i * 0.1, duration: 0.6 }
    })
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-5" tabIndex={0} onKeyDown={handleKey}>
      <h2 className="text-3xl font-bold mb-2">{t('wordle_title')}</h2>
      <div className="mb-4 text-lg">{t('score_label')}: {score}</div>

      <div className="grid gap-2">
        {board.map((row, idx) => (
          <motion.div key={idx} className="grid grid-cols-5 gap-2"
            animate={idx === attempt && shakeRow ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }} transition={{ duration: 0.6 }}>
            {row.map((tile, j) => {
              const showLetter = idx < attempt || (idx === attempt && tile.letter);
              return (
                <motion.div key={j} custom={j} initial="hidden" animate={tile.status ? 'visible' : 'hidden'} variants={flipVariants}
                  className={`w-14 h-14 flex items-center justify-center border-2 font-bold text-2xl uppercase
                    ${tile.status === 'correct' ? 'bg-green-500 border-green-500' : ''}
                    ${tile.status === 'present' ? 'bg-yellow-500 border-yellow-500' : ''}
                    ${tile.status === 'absent' ? 'bg-gray-500 border-gray-500' : ''}
                    ${tile.status === '' ? 'bg-transparent border-gray-600' : ''}`}
                >
                  {showLetter ? tile.letter : (idx === attempt ? currentGuess[j]?.toUpperCase() : '')}
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-10 gap-1">
        {ALPHABET.map(letter => (
          <button key={letter} onClick={() => handleClickKey(letter)}
            className={`w-12 h-12 flex items-center justify-center text-base font-bold uppercase rounded
              ${letterStatuses[letter]==='correct'? 'bg-green-500 text-white' : ''}
              ${letterStatuses[letter]==='present'? 'bg-yellow-500 text-white' : ''}
              ${letterStatuses[letter]==='absent'? 'bg-gray-500 text-white' : 'bg-gray-700 text-white'}`}
          >{letter}</button>
        ))}
        <button onClick={() => handleClickKey('ENTER')} className="col-span-2 w-full h-12 flex items-center justify-center text-base font-bold bg-blue-500 rounded">{t('submit')}</button>
        <button onClick={() => handleClickKey('DEL')} className="col-span-2 w-full h-12 flex items-center justify-center text-base font-bold bg-blue-500 rounded">Del</button>
      </div>

      <GameOverModal
        isOpen={gameStatus !== 'playing'}
        score={score}
        gameName="wordle"
        onClose={() => setGameStatus('playing')}
        onRestart={() => window.location.reload()}
      />
    </div>
  );
};

export default WordleGame;
