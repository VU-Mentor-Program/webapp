import React, { useState } from "react";

interface MuteButtonProps {
  onToggle: (muted: boolean) => void;
}

const MuteButton: React.FC<MuteButtonProps> = ({ onToggle }) => {
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const newMutedState = !muted;
    setMuted(newMutedState);
    onToggle(newMutedState);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleMute}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-300 ${
          muted ? "bg-gray-500" : "bg-gray-700"
        } text-2xl`}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
};

export default MuteButton;
