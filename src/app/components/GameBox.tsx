"use client";

interface GameBoxProps {
  number: number;
  isExplosive: boolean;
  hasRed: boolean;
  hasBlue: boolean;
  redAnimating?: boolean;
  blueAnimating?: boolean;
  isCurrentPlayerHere?: boolean;
}

export default function GameBox({
  number,
  isExplosive,
  hasRed,
  hasBlue,
  redAnimating,
  blueAnimating,
  isCurrentPlayerHere,
}: GameBoxProps) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center 
        w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 
        border border-gray-300 mx-0.5 md:mx-1
        ${isExplosive ? "bg-slate-300" : "bg-slate-100"}
        ${isCurrentPlayerHere ? "ring-2 ring-slate-900" : ""}
        `}
      id={`box-${number}`}
    >
      {/* Box number */}
      <div className="text-xs md:text-sm lg:text-lg font-semibold">
        {number}
      </div>

      {/* Explosive label */}
      {isExplosive && (
        <div className="text-[8px] md:text-xs italic text-teal-700 animate-ping">
          explosive
        </div>
      )}

      {/* Player markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasRed && !redAnimating && (
          <div className="absolute w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 bg-violet-600 border-2 border-white transform -translate-x-1 md:-translate-x-2 lg:-translate-x-3 z-10" />
        )}
        {hasBlue && !blueAnimating && (
          <div className="absolute w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 bg-pink-600 border-2 border-white transform translate-x-1 md:translate-x-2 lg:translate-x-3 z-10" />
        )}
      </div>
    </div>
  );
}
