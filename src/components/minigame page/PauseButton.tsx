import React from "react";
import { PauseCircle, PlayCircle } from "lucide-react";

interface PauseButtonProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

const PauseButton: React.FC<PauseButtonProps> = ({ isPaused, onTogglePause }) => {
  return (
    <button
      onClick={onTogglePause}
      className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-md transition-all"
    >
      {isPaused ? <PlayCircle size={28} /> : <PauseCircle size={28} />}
    </button>
  );
};

export default PauseButton;
