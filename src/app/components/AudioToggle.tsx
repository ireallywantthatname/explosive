"use client";

import React from "react";
import { useAudio } from "../contexts/AudioContext";

export const AudioToggle: React.FC = () => {
  const { isPlaying, toggleAudio, hasInteracted } = useAudio();

  // Display a pulsing effect for the button before interaction
  const buttonClass = `fixed bottom-4 right-4 z-50 p-2 rounded-full transition-colors ${
    hasInteracted
      ? isPlaying
        ? "bg-slate-800 text-white hover:bg-slate-700"
        : "bg-slate-300 text-slate-800 hover:bg-slate-400"
      : "bg-slate-800 text-white hover:bg-slate-700 animate-pulse"
  }`;

  return (
    <button
      onClick={toggleAudio}
      className={buttonClass}
      aria-label={
        !hasInteracted
          ? "Click to enable background music"
          : isPlaying
          ? "Mute background music"
          : "Unmute background music"
      }
    >
      {!hasInteracted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      ) : isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      )}
    </button>
  );
};
