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
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <button
        onClick={handleRoll}
        disabled={isRolling || disabled}
        className={`
          px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-white text-sm sm:text-base
          w-full sm:w-auto
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
          w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
          border-2 border-gray-400 font-bold text-lg sm:text-xl mt-2 sm:mt-0
          ${isRolling ? "animate-bounce" : ""}
        `}
      >
        {isRolling ? "?" : value || ""}
      </div>
    </div>
  );
}
