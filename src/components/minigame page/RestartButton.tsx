import React from "react";
import { RotateCcw } from "lucide-react";

interface RestartButtonProps {
  onRestart: () => void;
}

const RestartButton: React.FC<RestartButtonProps> = ({ onRestart }) => {
  return (
    <button
      onClick={onRestart}
      className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-md transition-all"
    >
      <RotateCcw size={28} />
    </button>
  );
};

export default RestartButton;
