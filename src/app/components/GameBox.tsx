"use client";

interface GameBoxProps {
  number: number;
  isExplosive: boolean;
  hasRed: boolean;
  hasBlue: boolean;
}

export default function GameBox({
  number,
  isExplosive,
  hasRed,
  hasBlue,
}: GameBoxProps) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center 
        w-16 h-16 border-2 border-gray-300 mx-1
        ${isExplosive ? "bg-slate-300" : "bg-slate-100"}
      `}
    >
      {/* Box number */}
      <div className="text-lg font-bold">{number}</div>

      {/* Explosive label */}
      {isExplosive && (
        <div className="text-xs italic text-teal-700 animate-ping">explosive</div>
      )}

      {/* Player markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasRed && (
          <div className="absolute w-6 h-6 bg-violet-700 rounded-full transform -translate-x-3 z-10" />
        )}
        {hasBlue && (
          <div className="absolute w-6 h-6 bg-pink-700 rounded-full transform translate-x-3 z-10" />
        )}
      </div>
    </div>
  );
}
