import React from "react";

interface SpeedSliderProps {
  speed: number;
  onChange: (value: number) => void;
}

const SpeedSlider: React.FC<SpeedSliderProps> = ({ speed, onChange }) => {
  return (
    <div className="my-3">
      <label className="block text-white text-lg">Snake Speed: {500 - speed}ms</label>
      <input
        type="range"
        min="50" // FASTEST speed
        max="500" // SLOWEST speed
        step="10"
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

export default SpeedSlider;
