"use client";

interface GameBoxProps {
  number: number;
  isExplosive: boolean;
  hasRed: boolean;
  hasBlue: boolean;
  redTargetPosition?: number;
  blueTargetPosition?: number;
  redAnimating?: boolean;
  blueAnimating?: boolean;
  boxPositions?: Record<number, { top: number; left: number }>;
}

export default function GameBox({
  number,
  isExplosive,
  hasRed,
  hasBlue,
  redTargetPosition,
  blueTargetPosition,
  redAnimating,
  blueAnimating,
  boxPositions,
}: GameBoxProps) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center 
        w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 
        border border-gray-300 mx-0.5 md:mx-1
        ${isExplosive ? "bg-slate-300" : "bg-slate-100"}
      `}
      id={`box-${number}`}
    >
      {/* Box number */}
      <div className="text-xs md:text-sm lg:text-lg font-bold">{number}</div>

      {/* Explosive label */}
      {isExplosive && (
        <div className="text-[8px] md:text-xs italic text-teal-700 animate-ping">
          explosive
        </div>
      )}

      {/* Player markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasRed && !redAnimating && (
          <div className="absolute w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 bg-violet-700 rounded-full transform -translate-x-1 md:-translate-x-2 lg:-translate-x-3 z-10" />
        )}
        {hasBlue && !blueAnimating && (
          <div className="absolute w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 bg-pink-700 rounded-full transform translate-x-1 md:translate-x-2 lg:translate-x-3 z-10" />
        )}
      </div>
    </div>
  );
}
