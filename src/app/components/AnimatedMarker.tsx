"use client";

import { useEffect, useState } from "react";

interface AnimatedMarkerProps {
  color: "red" | "blue";
  sourcePosition: number;
  targetPosition: number;
  onAnimationComplete: () => void;
}

export default function AnimatedMarker({
  color,
  sourcePosition,
  targetPosition,
  onAnimationComplete,
}: AnimatedMarkerProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Colors for the markers
  const bgColor = color === "red" ? "bg-violet-600" : "bg-pink-600";
  const xOffset =
    color === "red"
      ? "-translate-x-1 md:-translate-x-2 lg:-translate-x-3"
      : "translate-x-1 md:translate-x-2 lg:translate-x-3";

  useEffect(() => {
    const animateMarker = async () => {
      // Get source box position
      const sourceBox = document.getElementById(`box-${sourcePosition}`);
      // Get target box position
      const targetBox = document.getElementById(`box-${targetPosition}`);

      if (!sourceBox || !targetBox) return;

      setIsAnimating(true);

      // Get the positions
      const sourceRect = sourceBox.getBoundingClientRect();
      const targetRect = targetBox.getBoundingClientRect();

      // Set initial position
      const boardContainer = sourceBox.closest(".min-w-max");
      const boardRect = boardContainer?.getBoundingClientRect() || {
        top: 0,
        left: 0,
      };

      // Initial position (relative to the board)
      setPosition({
        top: sourceRect.top - boardRect.top + sourceRect.height / 2 - 12,
        left: sourceRect.left - boardRect.left + sourceRect.width / 2 - 12,
      });

      // Allow the initial position to render first
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Animate to final position
      setPosition({
        top: targetRect.top - boardRect.top + targetRect.height / 2 - 12,
        left: targetRect.left - boardRect.left + targetRect.width / 2 - 12,
      });

      // Wait for animation to complete
      setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete();
      }, 2000); // Long duration for slow animation
    };

    animateMarker();
  }, [sourcePosition, targetPosition, onAnimationComplete]);

  if (!isAnimating) return null;

  return (
    <div
      className={`absolute w-4 h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 ${bgColor} border-2 border-white transform ${xOffset} z-20`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transition: "top 2s ease, left 2s ease", // Slow 2-second transition
      }}
    />
  );
}
