"use client";

import { useState, useEffect } from "react";

interface CutSceneProps {
  text: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function CutScene({
  text,
  onClose,
  autoClose = false,
  autoCloseDelay = 10000, // 10 seconds by default
}: CutSceneProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    // Auto close timer if enabled
    let closeTimer: NodeJS.Timeout | null = null;
    if (autoClose) {
      closeTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Allow fade out to complete
      }, autoCloseDelay);
    }

    return () => {
      clearTimeout(timer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [autoClose, autoCloseDelay, onClose]);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onClose, 500); // Allow fade out to complete
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-95 transition-opacity duration-500 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="text-center p-8 max-w-3xl">
        <p className="text-2xl md:text-3xl text-white leading-relaxed mb-12 italic">
          {text}
        </p>
        <button
          onClick={handleSkip}
          className="px-6 py-3 bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
