import React from "react";
import { useTranslations } from "../../contexts/TranslationContext";

interface SpeedSliderProps {
  speed: number;
  onChange: (value: number) => void;
}

const SpeedSlider: React.FC<SpeedSliderProps> = ({ speed, onChange }) => {
  const t = useTranslations("minigames")
  return (
    <div className="my-3">
      <label className="block text-white text-lg">{t("snake_speed")} {500 - speed}ms</label>
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
