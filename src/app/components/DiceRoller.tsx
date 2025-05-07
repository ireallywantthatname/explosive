"use client";

import { useState } from "react";

interface DiceRollerProps {
  onRoll: (value: number) => void;
  value: number | null;
  disabled?: boolean;
}

export default function DiceRoller({
  onRoll,
  value,
  disabled = false,
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (isRolling || disabled) return;

    // Start rolling animation
    setIsRolling(true);

    // Generate random value between 1 and 6
    const newValue = Math.floor(Math.random() * 6) + 1;

    // Simulate dice roll animation
    setTimeout(() => {
      onRoll(newValue);
      setIsRolling(false);
    }, 800);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleRoll}
        disabled={isRolling || disabled}
        className={`
          px-4 py-2 font-bold text-white 
          ${
            isRolling || disabled
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-900"
          }
          transition duration-200
        `}
      >
        Roll the dice
      </button>

      <div
        className={`
          w-12 h-12 flex items-center justify-center
          border-2 border-gray-400 font-bold text-xl
          ${isRolling ? "animate-bounce" : ""}
        `}
      >
        {isRolling ? "?" : value || ""}
      </div>
    </div>
  );
}
